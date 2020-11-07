import { fork, Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { Test, TestResult } from '@bigtest/suite';
import { Atom } from '@bigtest/atom';
import { AgentEvent, Command as AgentCommand } from '@bigtest/agent';
import { AgentState, OrchestratorState, BundlerState } from './orchestrator/state';
import { TestRunAggregator } from './result-aggregator/test-run';
import { CommandMessage, RunMessage } from './command-server';
import { filterTest } from './filter-test';

interface CommandProcessorOptions {
  atom: Atom<OrchestratorState>;
  commands: Mailbox<CommandMessage>;
  events: Mailbox<AgentEvent>;
  delegate: Mailbox<AgentCommand & { agentId: string }>;
  proxyPort: number;
  manifestPort: number;
  testFiles?: string[];
};

function* run({ id: testRunId, files }: RunMessage, options: CommandProcessorOptions): Operation {
  console.debug('[command processor] running test', testRunId);

  let stepTimeout = 60_000;
  let testRunSlice = options.atom.slice()('testRuns', testRunId);

  let bundlerSlice = options.atom.slice()('bundler');

  let bundler: BundlerState = yield bundlerSlice.once((state) => state.type === 'GREEN' || state.type === 'ERRORED');

  if(bundler.type === 'GREEN') {
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

    let appStatus = options.atom.slice()("appService", "status").get();

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
      options.delegate.send({ type: 'run', agentId, appUrl, manifestUrl, testRunId, tree: test, stepTimeout });
    }

    let aggregator = new TestRunAggregator(testRunSlice, { testRunId, ...options });

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

export function* createCommandProcessor(options: CommandProcessorOptions): Operation {
  while(true) {
    let message = yield options.commands.receive({ type: 'run' });

    console.debug('[command processor] received message', message);

    yield fork(run(message, options));
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
