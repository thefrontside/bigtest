import { EventEmitter } from 'events';
import { fork, Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { Test, TestResult } from '@bigtest/suite';
import { Atom } from '@bigtest/atom';
import { AgentEvent, Command as AgentCommand } from '@bigtest/agent';
import { AgentState, TestRunState, OrchestratorState } from './orchestrator/state';
import { TestRunAggregator } from './result-aggregator/test-run';
import { CommandMessage } from './command-server';

interface CommandProcessorOptions {
  bus: EventEmitter;
  atom: Atom<OrchestratorState>;
  commands: Mailbox<CommandMessage>;
  events: Mailbox<AgentEvent>;
  delegate: Mailbox<AgentCommand & { agentId: string }>;
  proxyPort: number;
  manifestPort: number;
};

function* run(testRunId: string, options: CommandProcessorOptions): Operation {
  console.debug('[command processor] running test', testRunId);

  let testRunSlice = options.atom.slice<TestRunState>(['testRuns', testRunId]);
  let manifest = options.atom.get().manifest;

  let appUrl = `http://localhost:${options.proxyPort}`;
  let manifestUrl = `http://localhost:${options.manifestPort}/${manifest.fileName}`;

  // todo: we should perform filtering of the agents here
  let agents: AgentState[] = Object.values(options.atom.get().agents);

  // todo: we should perform filtering of the manifest here
  let result = resultsFor(manifest);

  testRunSlice.set({
    testRunId: testRunId,
    status: 'pending',
    agents: Object.fromEntries(agents.map((agent) => [agent.agentId, { agent, result, status: 'pending' }])),
  });

  for (let agent of agents) {
    let { agentId } = agent;

    console.debug(`[command processor] starting test run ${testRunId} on agent ${agentId}`);
    options.delegate.send({ type: 'run', agentId, appUrl, manifestUrl, testRunId, tree: manifest });
  }

  let aggregator = new TestRunAggregator(testRunSlice, { testRunId, ...options });

  yield aggregator.run();
}

export function* createCommandProcessor(options: CommandProcessorOptions): Operation {
  while(true) {
    let message = yield options.commands.receive({ type: 'run' });

    console.debug('[command processor] received message', message);

    yield fork(run(message.id, options));
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
