import { fork, spawn, Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { Test, TestResult, StepResult, AssertionResult, ResultStatus } from '@bigtest/suite';
import { Atom, Slice } from '@bigtest/atom';
import { AgentState, TestRunState, OrchestratorState, TestRunAgentState } from './orchestrator/state';

interface CommandProcessorOptions {
  atom: Atom<OrchestratorState>;
  inbox: Mailbox;
  delegate: Mailbox;
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

  testRunSlice.set({ testRunId: testRunId, status: 'pending', agents: {} });

  let runStatus = testRunSlice.slice<ResultStatus>(['status']);

  yield function*() {
    for(let agent of agents) {
      yield fork(function*() {
        runStatus.set('running');

        let testRunAgentSlice = testRunSlice.slice<TestRunAgentState>(['agents', agent.agentId]);
        testRunAgentSlice.set({ agent, result, status: 'pending' });

        let runAgentStatus = testRunAgentSlice.slice<ResultStatus>(['status']);

        console.debug(`[command processor] starting test run ${testRunId} on agent ${agent.agentId}`);

        options.delegate.send({ type: 'run', status: 'pending', agentId: agent.agentId, appUrl, manifestUrl, testRunId: testRunId, tree: manifest });

        runAgentStatus.set('running');
        try {
          let resultSlice = testRunAgentSlice.slice<TestResult>(['result']);

          yield runTest(agent.agentId, resultSlice, [resultSlice.get().description]);
        } finally {
          runAgentStatus.set('ok');
        }
      });
    }
  }

  runStatus.set('ok');

  function* runTest(agentId: string, result: Slice<TestResult, OrchestratorState>, path: string[]): Operation<void> {
    let testStatus = result.slice<ResultStatus>(['status']);

    yield spawn(function* () {
      yield options.inbox.receive({ type: 'test:running', agentId, testRunId, path });
      testStatus.set('running');
    })

    try {

      yield collectTestResult(agentId, result, path);

      testStatus.set('ok');

    } catch (error) {
      testStatus.set('failed');
    } finally {
      if (testStatus.get() === 'pending' || testStatus.get() === 'running') {
        testStatus.set('disregarded');
      }
    }
  }

  function* collectTestResult(agentId: string, result: Slice<TestResult, OrchestratorState>, path: string[]): Operation<void> {
    for (let [index, child] of result.get().children.entries()) {
      yield fork(runTest(agentId, result.slice<TestResult>(['children', index]), path.concat(child.description)));
    }

    for (let [index, assertion] of result.get().assertions.entries()) {
      yield fork(collectAssertionResult(agentId, result.slice<AssertionResult>(['assertions', index]), path.concat(assertion.description)));
    }

    for (let [index, step] of result.get().steps.entries()) {
      yield fork(collectStepResult(agentId, result.slice<StepResult>(['steps', index]), path.concat(step.description)));
    }
  }

  function* collectStepResult(agentId: string, result: Slice<StepResult, OrchestratorState>, path: string[]) {
    let stepStatus = result.slice<ResultStatus>(['status']);


    try {
      let update: {status: ResultStatus} = yield function*() {
        yield spawn(function* () {
          yield options.inbox.receive({ type: 'step:running', agentId, testRunId, path });
          stepStatus.set('running');
        });
        return yield options.inbox.receive({ type: 'step:result', agentId, testRunId, path });
      }

      if (update.status === 'failed') {
        stepStatus.set('failed');
        throw new Error('Step Failed');
      }

      stepStatus.set(update.status);
    } finally {
      if (stepStatus.get() === 'pending' || stepStatus.get() === 'running') {
        stepStatus.set('disregarded');
      }
    }
  }

  function* collectAssertionResult(agentId: string, result: Slice<AssertionResult, OrchestratorState>, path: string[]) {
    let assertionStatus = result.slice<ResultStatus>(['status']);

    try {
      let update: {status: ResultStatus} = yield function*() {
        yield spawn(function*() {
          yield options.inbox.receive({ type: 'assertion:running', agentId, testRunId, path });
          assertionStatus.set('running');
        });
        return yield options.inbox.receive({ type: 'assertion:result', agentId, testRunId, path });
      }

      assertionStatus.set(update.status);
    } finally {
      if (assertionStatus.get() === 'pending' || assertionStatus.get() === 'running') {
        assertionStatus.set('disregarded');
      }
    }
  }

}

export function* createCommandProcessor(options: CommandProcessorOptions): Operation {
  while(true) {
    let message = yield options.inbox.receive({ type: 'run' });

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
