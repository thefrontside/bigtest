import { Operation, Subscription, spawn } from 'effection';
import { Slice } from '@effection/atom';
import { Stream, createStream } from '@effection/subscription';
import { TestResult, StepResult, AssertionResult, ResultStatus } from '@bigtest/suite';
import { TestRunState, TestRunAgentState } from './orchestrator/state';
import { TestEvent } from './schema/test-event';

type Publish = (event: TestEvent) => void;

export function resultStream(testRunId: string, slice: Slice<TestRunState>): Stream<TestEvent, void> {
  return createStream<TestEvent, void>((publish) => function*() {
    yield slice.filter((state) => !!state).expect();
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
function* streamResults(type: string, slice: Slice<any>, publish: Publish, options: StreamerOptions): Operation<void> {
  let statusSlice = slice.slice('status');
  let previousStatus = undefined;
  let currentStatus = statusSlice.get();

  let subscription: Subscription<unknown> = yield statusSlice;
  let next: IteratorResult<ResultStatus>;
  do {
    if(currentStatus !== previousStatus) {
      if(currentStatus === 'pending') {
        // do nothing
      } else if(currentStatus === 'running') {
        publish({
          type: `${type}:running`,
          ...options,
        } as TestEvent);
      } else {
        publish({
          type: `${type}:result`,
          ...slice.get(),
          ...options,
        } as TestEvent);
        return;
      }
      previousStatus = currentStatus;
    }
    next = yield subscription.next();
    currentStatus = next.value;
  } while(!next.done);
}

function* streamTestRun(slice: Slice<TestRunState>, publish: Publish, options: StreamerOptions): Operation<void> {
  for(let agentId in slice.get().agents) {
    let testRunAgentSlice = slice.slice('agents', agentId);
    yield spawn(streamTestRunAgent(testRunAgentSlice, publish, { agentId, ...options }), { blockParent: true });
  };
  yield streamResults('testRun', slice, publish, options);
}

function* streamTestRunAgent(slice: Slice<TestRunAgentState>, publish: Publish, options: StreamerAgentOptions): Operation<void> {
  let testResultSlice = slice.slice('result');

  yield spawn(streamTest(testResultSlice, publish, {
    ...options,
    path: [testResultSlice.get().description],
  }), { blockParent: true });
  yield streamResults('testRunAgent', slice, publish, options);
}

function* streamTest(slice: Slice<TestResult>, publish: Publish, options: StreamerTestOptions): Operation<void> {
  for(let [index, step] of Object.entries(slice.get().steps)) {
    let stepSlice = slice.slice('steps', Number(index));
    yield spawn(streamStep(stepSlice, publish, {
      ...options,
      path: options.path.concat(`${index}:${step.description}`),
    }), { blockParent: true });
  }
  for(let [index, assertion] of Object.entries(slice.get().assertions)) {
    let assertionSlice = slice.slice('assertions', Number(index));
    yield spawn(streamAssertion(assertionSlice, publish, {
      ...options,
      path: options.path.concat(assertion.description),
    }), { blockParent: true });
  }
  for(let [index, child] of Object.entries(slice.get().children)) {
    let childSlice = slice.slice('children', Number(index));
    yield spawn(streamTest(childSlice, publish, {
      ...options,
      path: options.path.concat(child.description),
    }), { blockParent: true });
  }
  yield streamResults('test', slice, publish, options);
}

function* streamStep(slice: Slice<StepResult>, publish: Publish, options: StreamerTestOptions): Operation<void> {
  yield streamResults('step', slice, publish, options)
}

function* streamAssertion(slice: Slice<AssertionResult>, publish: Publish, options: StreamerTestOptions): Operation<void> {
  yield streamResults('assertion', slice, publish, options)
}
