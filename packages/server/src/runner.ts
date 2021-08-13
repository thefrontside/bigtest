import { Task, Resource } from 'effection';
import { Test, TestResult } from '@bigtest/suite';
import { Slice } from '@effection/atom';
import { AgentState, OrchestratorState, BundlerState } from './orchestrator/state';
import { aggregateTestRun } from './result-aggregator';
import { filterTest } from './filter-test';
import { resultStream } from './result-stream';
import { TestEvent } from './schema/test-event';

import { ConnectionChannel } from './connection-server';

export interface RunnerOptions {
  atom: Slice<OrchestratorState>;
  channel: ConnectionChannel;
  proxyPort: number;
  manifestPort: number;
  testFiles?: string[];
};

export interface RunOptions {
  testRunId: string;
  files: string[];
}

export interface Runner {
  runTest(options: RunOptions): Promise<void>;
  subscribe(id: string): AsyncIterator<TestEvent>;
}

function resultsFor(tree: Test): TestResult {
  return {
    description: tree.description,
    status: 'pending',
    steps: tree.steps.map(step => ({
      description: step.description,
      status: 'pending'
    })),
    assertions: tree.assertions.map(assertion => ({
      description: assertion.description,
      status: 'pending'
    })),
    children: tree.children.map(resultsFor)
  }
}

export function createAgentRunner(options: RunnerOptions): Resource<Runner> {
  return {
    *init(scope: Task) {
      return {
        runTest({ testRunId, files }: RunOptions): Promise<void> {
          return scope.run(function*(task) {
            console.debug('[command processor] running test', testRunId);
            let stepTimeout = 60_000;
            let testRunSlice = options.atom.slice('testRuns', testRunId);

            let bundlerSlice = options.atom.slice('bundler');

            let bundler: BundlerState = yield bundlerSlice.filter((state) => state.type === 'GREEN' || state.type === 'ERRORED').expect();

            if(bundler.type === 'GREEN') {
              let events = options.channel.match({ testRunId }).buffer(task);

              let manifest = options.atom.get().manifest;

              let appUrl = `http://localhost:${options.proxyPort}`;
              let manifestUrl = `http://localhost:${options.manifestPort}/${manifest.fileName}`;

              let test;
              try {
                test = filterTest(manifest, { files, testFiles: options.testFiles });
              } catch(error) {
                testRunSlice.set({
                  testRunId: testRunId,
                  status: 'failed',
                  error: { name: 'FilterError', message: error.message },
                  agents: {}
                });
                return;
              }

              let appStatus = options.atom.slice("appServer").get();

              if(appStatus.type === 'exited') {
                // todo: format stdout and stderr separately instead of appending?
                testRunSlice.set({
                  testRunId: testRunId,
                  status: 'failed',
                  error: {
                    name: 'AppError',
                    message: `Application exited unexpectedly with exit code ${appStatus.exitStatus.code} with the following output:\n\n${appStatus.exitStatus.stdout}\n${appStatus.exitStatus.stderr}`
                  },
                  agents: {}
                });
                return;
              }

              // todo: we should perform filtering of the agents here
              let agents: AgentState[] = Object.values(options.atom.get().agents);

              let result = resultsFor(test);

              testRunSlice.set({
                testRunId: testRunId,
                status: 'pending',
                agents: Object.fromEntries(agents.map((agent) => [agent.agentId, { agent, result, status: 'pending' }])),
              });

              for (let agent of agents) {
                let { agentId } = agent;

                console.debug(`[command processor] starting test run ${testRunId} on agent ${agentId}`);
                options.channel.send({ type: 'run', agentId, appUrl, manifestUrl, testRunId, tree: test, stepTimeout });
              }

              yield aggregateTestRun(events, testRunSlice);
            }
            if(bundler.type === 'ERRORED') {
              testRunSlice.set({
                testRunId: testRunId,
                status: 'failed',
                agents: {},
                error: {
                  name: 'BundlerError',
                  message: [
                    'Cannot run tests due to build errors in the test suite:',
                    bundler.error.message,
                    bundler.error.frame,
                  ].filter(Boolean).join('\n'),
                  stack: bundler.error.loc && [
                    {
                      fileName: bundler.error.loc.file,
                      line: bundler.error.loc.line,
                      column: bundler.error.loc.column,
                    }
                  ]
                }
              });
            }
          });
        },

        async *subscribe(id: string): AsyncIterator<TestEvent> {
          let slice = options.atom.slice('testRuns', id);
          let innerScope = scope.run();

          let subscription = resultStream(id, slice).subscribe(innerScope);

          try {
            while(true) {
              let iter = await scope.run(subscription.next());
              if(iter.done) {
                break;
              } else {
                yield iter.value;
              }
            }
          } finally {
            innerScope.halt();
          }
        }
      }
    }
  }
}
