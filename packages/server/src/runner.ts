import { Task, Resource, createChannel } from 'effection';
import { Test, TestResult, ResultStatus } from '@bigtest/suite';
import { Slice } from '@effection/atom';
import { AgentState, OrchestratorState, BundlerState, AppServerStatusExited } from './orchestrator/state';
import { aggregate } from './result-aggregator';
import { filterTest } from './filter-test';
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

class AppError extends Error {
  name = 'AppError';

  constructor(appStatus: AppServerStatusExited) {
    super(`Application exited unexpectedly with exit code ${appStatus.exitStatus.code} with the following output:\n\n${appStatus.exitStatus.stdout}\n${appStatus.exitStatus.stderr}`);
  }
}

const isComplete = (status: ResultStatus) => status === 'ok' || status === 'failed' || status === 'disregarded';

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
    let { send, stream } = createChannel<TestEvent>();
    return {
      runTest({ testRunId, files }: RunOptions): Promise<void> {
        return scope.run(function*() {
          console.debug('[command processor] running test', testRunId);
          let stepTimeout = 60_000;
          let testRunSlice = options.atom.slice('testRuns', testRunId);

          try {
            let bundlerSlice = options.atom.slice('bundler');

            let bundler: BundlerState = yield bundlerSlice.filter((state) => state.type === 'GREEN' || state.type === 'ERRORED').expect();

            if(bundler.type === 'GREEN') {
              let events = yield options.channel.match({ testRunId });

              let manifest = options.atom.get().manifest;

              let appUrl = `http://localhost:${options.proxyPort}`;
              let manifestUrl = `http://localhost:${options.manifestPort}/${manifest.fileName}`;

              let test = filterTest(manifest, { files, testFiles: options.testFiles });

              let appStatus = options.atom.slice("appServer").get();

              if(appStatus.type === 'exited') {
                throw new AppError(appStatus);
              }

              // todo: we should perform filtering of the agents here
              let agents: AgentState[] = Object.values(options.atom.get().agents).filter(Boolean);

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

              yield aggregate(events, testRunSlice, send);
            }
            if(bundler.type === 'ERRORED') {
              throw bundler.error;
            }
          } catch(err) {
            let error = { name: err.name, message: err.message }
            testRunSlice.set({ testRunId: testRunId, status: 'failed', agents: {}, error });
            send({ testRunId: testRunId, type: 'testRun', status: 'failed', error });
          }
        });
      },

      async *subscribe(id: string): AsyncIterator<TestEvent> {
        let innerScope = scope.run();
        let subscription = stream.match({ testRunId: id }).subscribe(innerScope);

        try {
          while(true) {
            let iter = await scope.run(subscription.next());
            if(iter.done) {
              break;
            } else {
              yield iter.value;
              if(iter.value.type === 'testRun' && isComplete(iter.value.status)) {
                break;
              }
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
