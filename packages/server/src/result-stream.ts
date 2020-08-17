import { Operation, fork } from 'effection';
import { Slice } from '@bigtest/atom';
import { subscribe, Subscription, createSubscription } from '@effection/subscription';
import { TestResult, StepResult, AssertionResult } from '@bigtest/suite';
import { OrchestratorState, TestRunState, TestRunAgentState } from './orchestrator/state';
import { TestEvent } from './schema/test-event';

type Publish = (event: TestEvent) => void;

export function* resultStream(testRunId: string, slice: Slice<TestRunState, OrchestratorState>): Operation<Subscription<TestEvent, void>> {
  return yield createSubscription(function*(publish) {
    yield slice.once((state) => state?.status === 'pending');
    yield streamTestRun(slice, publish, { testRunId });
  });
}

export interface StreamerOptions {
  testRunId: string;
}

export interface StreamerAgentOptions extends StreamerOptions {
  agentId: string;
}

export interface StreamerTestOptions extends StreamerAgentOptions {
  path: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function* streamResults(type: string, slice: Slice<any, OrchestratorState>, publish: Publish, options: StreamerOptions): Operation<void> {
  let statusSlice = slice.slice('status');
  let previousStatus = statusSlice.get();

  let subscription = yield subscribe(statusSlice);
  while(true) {
    let { done, value: status } = yield subscription.next();
    if(done) {
      return;
    } else if(status !== previousStatus) {
      if(status === 'pending') {
        // do nothing
      } else if(status === 'running') {
        publish({
          type: `${type}:running`,
          ...options,
        } as TestEvent);
      } else {
        publish({
          type: `${type}:result`,
          status: status,
          error: slice.get().error,
          timeout: slice.get().timeout,
          ...options,
        } as TestEvent);
        return;
      }
      previousStatus = status;
    }
  };
}

function* streamTestRun(slice: Slice<TestRunState, OrchestratorState>, publish: Publish, options: StreamerOptions): Operation<void> {
  for(let agentId in slice.get().agents) {
    let testRunAgentSlice = slice.slice('agents', agentId);
    yield fork(streamTestRunAgent(testRunAgentSlice, publish, { agentId, ...options }));
  };
  yield streamResults('testRun', slice, publish, options);
}

function* streamTestRunAgent(slice: Slice<TestRunAgentState, OrchestratorState>, publish: Publish, options: StreamerAgentOptions): Operation<void> {
  let testResultSlice = slice.slice('result');

  yield fork(streamTest(testResultSlice, publish, {
    ...options,
    path: [testResultSlice.get().description],
  }));
  yield streamResults('testRunAgent', slice, publish, options);
}

function* streamTest(slice: Slice<TestResult, OrchestratorState>, publish: Publish, options: StreamerTestOptions): Operation<void> {
  for(let [index, step] of Object.entries(slice.get().steps)) {
    let stepSlice = slice.slice('steps', Number(index));
    yield fork(streamStep(stepSlice, publish, {
      ...options,
      path: options.path.concat(step.description),
    }));
  }
  for(let [index, assertion] of Object.entries(slice.get().assertions)) {
    let assertionSlice = slice.slice('assertions', Number(index));
    yield fork(streamAssertion(assertionSlice, publish, {
      ...options,
      path: options.path.concat(assertion.description),
    }));
  }
  for(let [index, child] of Object.entries(slice.get().children)) {
    let childSlice = slice.slice('children', Number(index));
    yield fork(streamTest(childSlice, publish, {
      ...options,
      path: options.path.concat(child.description),
    }));
  }
  yield streamResults('test', slice, publish, options);
}

function* streamStep(slice: Slice<StepResult, OrchestratorState>, publish: Publish, options: StreamerTestOptions): Operation<void> {
  yield streamResults('step', slice, publish, options)
}

function* streamAssertion(slice: Slice<AssertionResult, OrchestratorState>, publish: Publish, options: StreamerTestOptions): Operation<void> {
  yield streamResults('assertion', slice, publish, options)
}
