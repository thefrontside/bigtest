import { Operation, Stream, all, spawn } from 'effection';
import { Slice } from '@effection/atom';
import { RunEnd, StepResult as StepResultEvent, AssertionResult as AssertionResultEvent } from '@bigtest/agent';
import { TestResult, StepResult, AssertionResult, ResultStatus } from '@bigtest/suite';
import { TestRunState, TestRunAgentState } from './orchestrator/state';
import { Incoming } from './connection-server';
import { createCoverageMap, CoverageMap, CoverageMapData } from 'istanbul-lib-coverage';

type Aggregator<T extends { status: string }, TExtra extends unknown[] = []> = (stream: Stream<Incoming>, slice: Slice<T>, ...extra: TExtra) => Operation<ResultStatus>;
type PathAggregator<T extends { status: string }> = Aggregator<T, [string[]]>;

function makeAggregator<T extends { status: string }, TExtra extends unknown[] = []>(agg: Aggregator<T, TExtra>): Aggregator<T, TExtra> {
  return function*(stream, slice, ...args): Operation<ResultStatus> {
    let statusSlice = slice.slice('status');

    try {
      return yield agg(stream, slice, ...args);
    } finally {
      if (statusSlice.get() === 'pending' || statusSlice.get() === 'running') {
        statusSlice.set('disregarded');
      }
    }
  };
}

export const aggregateTestRun: Aggregator<TestRunState> = makeAggregator(function*(stream, slice) {
  let agentRuns = Object.keys(slice.get().agents).map(agentId => {
    let testRunAgentSlice = slice.slice('agents', agentId);

    return aggregateTestRunAgent(stream.match({ agentId: agentId }), testRunAgentSlice);
  });

  let statuses: ResultStatus[] = yield all(agentRuns);
  let status: ResultStatus = statuses.some(status => status === 'failed') ? 'failed' : 'ok';

  let coverage = Object.values(slice.get().agents)
    .filter(agent => !!agent.coverage)
    .map(agent => agent.coverage as CoverageMapData)
    .reduce((current: CoverageMap | undefined, data) => {
      if (!current) {
        return createCoverageMap(data);
      } else {
        current.merge(data);
        return current;
      }
    }, undefined)

  slice.update(state => ({ ...state, status, coverage }));
  return status;
});

const aggregateTestRunAgent: Aggregator<TestRunAgentState> = makeAggregator(function*(stream, slice) {
  let testResultSlice = slice.slice('result');

  yield spawn(function*() {
    yield stream.match({ type: 'run:begin' }).expect();
    slice.slice('status').set('running');
  });

  let status: ResultStatus = yield aggregateTest(stream, testResultSlice, [testResultSlice.get().description]);

  let end: RunEnd = yield stream.match({ type: 'run:end' }).expect();

  slice.update(state => ({ ...state, status, coverage: end.coverage }))

  return status;
});

const aggregateTest: PathAggregator<TestResult> = makeAggregator(function*(stream, slice, path) {
  let statusSlice = slice.slice('status');

  try {
    let status: ResultStatus = yield function*(): Operation<ResultStatus> {
      yield spawn(function*() {
        yield stream.match({ type: 'test:running', path }).expect();
        statusSlice.set('running');
      });

      let steps = Array.from(slice.get().steps.entries()).map(([index, step]) => {
        return aggregateStep(stream, slice.slice('steps', index), path.concat(`${index}:${step.description}`));
      });

      let assertions = Array.from(slice.get().assertions.entries()).map(([index, assertion]) => {
        return aggregateAssertion(stream, slice.slice('assertions', index), path.concat(assertion.description))
      });

      let children = Array.from(slice.get().children.entries()).map(([index, child]) => {
        return aggregateTest(stream, slice.slice('children', index), path.concat(child.description))
      });

      let statuses: ResultStatus[] = yield all([...steps, ...assertions, ...children]);
      let status: ResultStatus = statuses.some(result => result === 'failed') ? 'failed' : 'ok';

      return status;
    }

    statusSlice.set(status);

    return status;
  } catch (error) {
    statusSlice.set('failed');
    return 'failed';
  }
});

const aggregateStep: PathAggregator<StepResult> = makeAggregator(function*(stream, slice, path) {
  let result: StepResultEvent = yield function*(): Operation<StepResultEvent> {
    yield spawn(function*() {
      yield stream.match({ type: 'step:running', path }).expect();
      slice.slice('status').set('running');
    });

    return yield stream.match({ type: 'step:result', path }).expect();
  }

  slice.update((s) => ({ ...s, ...result }));

  if (result.status === 'failed') {
    throw new Error('Step Failed');
  }

  return result.status;
});

const aggregateAssertion: PathAggregator<AssertionResult> = makeAggregator((stream, slice, path) => function*() {
  let result: AssertionResultEvent = yield function*(): Operation<AssertionResultEvent> {
    yield spawn(function*() {
      yield stream.match({ type: 'assertion:running', path }).expect();
      slice.slice('status').set('running');
    });

    return yield stream.match({ type: 'assertion:result', path }).expect();
  }


  slice.update((s) => ({ ...s, ...result }));

  return result.status;
});
