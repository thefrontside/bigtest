import { fork, monitor, Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { Test, TestResult, StepResult, AssertionResult, ResultStatus } from '@bigtest/suite';
import { Atom, Slice } from '@bigtest/atom';
import { TestRunState, OrchestratorState } from './orchestrator/state';

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
  let [agent] = Object.values(options.atom.get().agents);
  let manifest = options.atom.get().manifest;

  let appUrl = `http://localhost:${options.proxyPort}`;
  let manifestUrl = `http://localhost:${options.manifestPort}/${manifest.fileName}`;

  if(agent) {
    // todo: we should perform filtering of the manifest here
    testRunSlice.set({ testRunId: testRunId, status: 'pending', tree: resultsFor(manifest), agent });

    console.debug(`[command processor] starting test run ${testRunId} on agent ${agent.agentId}`);

    options.delegate.send({ type: 'run', status: 'pending', agentId: agent.agentId, appUrl, manifestUrl, testRunId: testRunId, tree: manifest });

    let status = testRunSlice.slice<'running'|'done'>(['status']);

    status.set('running');
    try {

      let result = testRunSlice.slice<TestResult>(['tree']);

      yield runTest(result, [result.get().description]);

    } finally {
      status.set('done');
    }
  }

  function* runTest(result: Slice<TestResult, OrchestratorState>, path: string[]) {
    let status = result.slice<ResultStatus>(['status']);

    yield monitor(function* () {
      yield options.inbox.receive({ type: 'test:running', testRunId, path });
      status.set('running');
    })

    try {

      yield collectTestResult(result, path);

      status.set('ok');

    } catch (error) {
      status.set('failed');
    } finally {
      if (status.get() === 'pending' || status.get() === 'running') {
        status.set('disregarded');
      }
    }
  }

  function* collectTestResult(result: Slice<TestResult, OrchestratorState>, path: string[]) {

    for (let [index, child] of result.get().children.entries()) {
      yield fork(runTest(result.slice<TestResult>(['children', index]), path.concat(child.description)));
    }

    for (let [index, assertion] of result.get().assertions.entries()) {
      yield fork(collectAssertionResult(result.slice<AssertionResult>(['assertions', index]), path.concat(assertion.description)));
    }

    for (let [index, step] of result.get().steps.entries()) {
      yield fork(collectStepResult(result.slice<StepResult>(['steps', index]), path.concat(step.description)));
    }
  }

  function* collectStepResult(result: Slice<StepResult, OrchestratorState>, path: string[]) {
    let status = result.slice<ResultStatus>(['status']);

    yield monitor(function* () {
      yield options.inbox.receive({ type: 'step:running', testRunId, path });
      status.set('running');
    })

    try {

      let update: {status: ResultStatus} = yield options.inbox.receive({ type: 'step:result', testRunId, path });

      if (update.status === 'failed') {
        status.set('failed');
        throw new Error('Step Failed');
      }

      status.set(update.status);
    } finally {
      if (status.get() === 'pending' || status.get() === 'running') {
        status.set('disregarded');
      }
    }
  }

  function* collectAssertionResult(result: Slice<AssertionResult, OrchestratorState>, path: string[]) {
    let status = result.slice<ResultStatus>(['status']);

    try {
      yield options.inbox.receive({ type: 'assertion:running', testRunId, path });

      status.set('running');

      let update: {status: ResultStatus} = yield options.inbox.receive({ type: 'assertion:result', testRunId, path });

      status.set(update.status);
    } finally {
      if (status.get() === 'pending' || status.get() === 'running') {
        status.set('disregarded');
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
