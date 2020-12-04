import { Operation } from 'effection';
import { Test, TestResult } from '@bigtest/suite';
import { Mailbox } from '@bigtest/effection';
import { Atom } from '@bigtest/atom';
import { AgentState, OrchestratorState, BundlerState } from './orchestrator/state';
import { TestRunAggregator } from './result-aggregator/test-run';
import { filterTest } from './filter-test';
import { SpawnContext } from './spawn-context';
import { resultStream } from './result-stream';
import { TestEvent } from './schema/test-event';

import { ConnectionChannel } from './connection-server';

export interface RunnerOptions {
  context: SpawnContext;
  atom: Atom<OrchestratorState>;
  agents: ConnectionChannel;
  proxyPort: number;
  manifestPort: number;
  testFiles?: string[];
};

export interface RunOptions {
  testRunId: string;
  files: string[];
}

export interface Runner {
  run(options: RunOptions): PromiseLike<void>;
  subscribe(id: string): AsyncIterator<TestEvent>;
}

export class AgentRunner implements Runner {
  constructor(public options: RunnerOptions) {
  }

  run(options: RunOptions): PromiseLike<void> {
    return this.options.context.spawn(this._run(options));
  };

  async *subscribe(id: string): AsyncIterator<TestEvent> {
    let slice = this.options.atom.slice('testRuns', id);

    let scope = this.options.context.spawn(undefined) as SpawnContext;

    let subscription = await scope.spawn(resultStream(id, slice))

    try {
      while(true) {
        let iter = await scope.spawn(subscription.next());
        if(iter.done) {
          break;
        } else {
          yield iter.value;
        }
      }
    } finally {
      scope.halt();
    }
  }

  private *_run({ testRunId, files }: RunOptions): Operation<void> {
    console.debug('[command processor] running test', testRunId);
    let stepTimeout = 60_000;
    let testRunSlice = this.options.atom.slice('testRuns', testRunId);

    let bundlerSlice = this.options.atom.slice('bundler');

    let bundler: BundlerState = yield bundlerSlice.once((state) => state.type === 'GREEN' || state.type === 'ERRORED');

    if(bundler.type === 'GREEN') {
      let events = yield Mailbox.from(this.options.agents.match({ testRunId }));

      events.setMaxListeners(100000);

      let manifest = this.options.atom.get().manifest;

      let appUrl = `http://localhost:${this.options.proxyPort}`;
      let manifestUrl = `http://localhost:${this.options.manifestPort}/${manifest.fileName}`;

      let test;
      try {
        test = filterTest(manifest, { files, testFiles: this.options.testFiles });
      } catch(error) {
        testRunSlice.set({
          testRunId: testRunId,
          status: 'failed',
          error: { name: 'FilterError', message: error.message },
          agents: {}
        });
        return;
      }

      let appStatus = this.options.atom.slice("appService", "status").get();

      if(appStatus.type === 'exited') {
        testRunSlice.set({
          testRunId: testRunId,
          status: 'failed',
          error: {
            name: 'AppError',
            message: `Application exited unexpectedly with exit code ${appStatus.exitStatus.code} with the following output:\n\n${appStatus.exitStatus.tail}`
          },
          agents: {}
        });
        return;
      }

      // todo: we should perform filtering of the agents here
      let agents: AgentState[] = Object.values(this.options.atom.get().agents);

      let result = resultsFor(test);

      testRunSlice.set({
        testRunId: testRunId,
        status: 'pending',
        agents: Object.fromEntries(agents.map((agent) => [agent.agentId, { agent, result, status: 'pending' }])),
      });

      for (let agent of agents) {
        let { agentId } = agent;

        console.debug(`[command processor] starting test run ${testRunId} on agent ${agentId}`);
        this.options.agents.send({ type: 'run', agentId, appUrl, manifestUrl, testRunId, tree: test, stepTimeout });
      }

      let aggregator = new TestRunAggregator(testRunSlice, { testRunId, events });

      yield aggregator.run();
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
  }
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
