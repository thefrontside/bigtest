import { Operation, Task, Subscription, all, spawn, createFuture, withLabels } from 'effection';
import { Slice } from '@effection/atom';
import { RunEnd, StepResult as StepResultEvent, AssertionResult as AssertionResultEvent } from '@bigtest/agent';
import { TestResult, StepResult, AssertionResult, ResultStatus } from '@bigtest/suite';
import { TestRunState, TestRunAgentState } from './orchestrator/state';
import { Incoming } from './connection-server';
import { createCoverageMap, CoverageMap, CoverageMapData } from 'istanbul-lib-coverage';
import { TestEvent, TestEventType } from './schema/test-event';

type Aggregator<T extends { status: string }> = (map: AggregatorMap, slice: Slice<T>) => Operation<ResultStatus>;
type Emit = (event: TestEvent) => void;

interface AggregatorMap {
  dispatch(message: Incoming): void;
  receive(type: string): Operation<Incoming>;
  withAgent(agentId: string): AggregatorMap;
  withPath(path: string | string[]): AggregatorMap;
  emit(event: Partial<TestEvent>): void;
};

function createAggregatorMap(key: MessageKey, emit: Emit, map: Map<string, (value: Incoming) => void> = new Map()): AggregatorMap {
  return {
    dispatch(message: Incoming) {
      let resolve = map.get(messageKey(message));
      if(resolve) {
        resolve(message);
      } else {
        console.debug(`[aggregator] received unknown message: ${JSON.stringify(message)}`);
      }
    },
    *receive(type: string) {
      let { future, resolve } = createFuture<Incoming>();
      map.set(messageKey({ type, ...key }), resolve);
      return yield future;
    },
    withAgent(agentId: string) {
      return createAggregatorMap({ ...key, agentId }, emit, map);
    },
    withPath(path: string | string[]) {
      return createAggregatorMap({ ...key, path: (key.path || []).concat(path) }, emit, map)
    },
    emit(event) {
      emit({ ...key, ...event } as TestEvent);
    }
  }
}

function makeAggregator<T extends { status: string }>(type: TestEventType, agg: Aggregator<T>): Aggregator<T> {
  return (map, slice) => withLabels(function*(): Operation<ResultStatus> {
    let statusSlice = slice.slice('status');

    try {
      return yield agg(map, slice);
    } finally {
      if (statusSlice.get() === 'pending' || statusSlice.get() === 'running') {
        statusSlice.set('disregarded');
        map.emit({ type, status: 'disregarded' });
      }
    }
  }, { name: `${type}Aggregator` });
}

interface MessageKey {
  type?: string;
  agentId?: string;
  testRunId?: string;
  path?: string[];
}

function messageKey(key: MessageKey): string {
  return JSON.stringify([key.type, key.agentId, key.path].filter((v) => v != null));
}

export const aggregate = (subscription: Subscription<Incoming>, slice: Slice<TestRunState>, emit: Emit): Operation<ResultStatus> => withLabels(function*() {
  let map = createAggregatorMap({ testRunId: slice.get().testRunId }, emit);

  yield spawn(subscription.forEach(function*(message) {
    map.dispatch(message);
  }));

  return yield aggregateTestRun(map, slice);
}, { name: 'aggregate' });

const aggregateTestRun: Aggregator<TestRunState> = makeAggregator('testRun', function*(map, slice) {
  let agentRuns = Object.keys(slice.get().agents).map(agentId => {
    let testRunAgentSlice = slice.slice('agents', agentId);

    return aggregateTestRunAgent(map.withAgent(agentId), testRunAgentSlice);
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
  map.emit({ type: 'testRun', status });
  return status;
});

const aggregateTestRunAgent: Aggregator<TestRunAgentState> = makeAggregator('agent', function*(map, slice) {
  let testResultSlice = slice.slice('result');

  yield spawn(function*() {
    yield map.receive('run:begin');
    slice.slice('status').set('running');
    map.emit({ type: 'agent', status: 'running' });
  }, { labels: { name: 'setRunning', expand: false } });

  let endTask: Task<RunEnd> = yield spawn(map.receive('run:end'));

  let status: ResultStatus = yield aggregateTest(map.withPath(testResultSlice.get().description), testResultSlice);

  let end: RunEnd = yield endTask;

  slice.update(state => ({ ...state, status, coverage: end.coverage }));

  map.emit({ type: 'agent', status });

  return status;
});

const aggregateTest: Aggregator<TestResult> = makeAggregator('test', function*(map, slice) {
  let statusSlice = slice.slice('status');

  try {
    let status: ResultStatus = yield function*(): Operation<ResultStatus> {
      yield spawn(function*() {
        yield map.receive('test:running');
        statusSlice.set('running');
        map.emit({ type: 'test', status: 'running' });
      }, { labels: { name: 'setRunning', expand: false } });

      let steps = Array.from(slice.get().steps.entries()).map(([index, step]) => {
        return aggregateStep(map.withPath(`${index}:${step.description}`), slice.slice('steps', index));
      });

      let assertions = Array.from(slice.get().assertions.entries()).map(([index, assertion]) => {
        return aggregateAssertion(map.withPath(assertion.description), slice.slice('assertions', index));
      });

      let children = Array.from(slice.get().children.entries()).map(([index, child]) => {
        return aggregateTest(map.withPath(child.description), slice.slice('children', index));
      });

      let statuses: ResultStatus[] = yield all([...steps, ...assertions, ...children]);
      let status: ResultStatus = statuses.some(result => result === 'failed') ? 'failed' : 'ok';

      return status;
    }

    statusSlice.set(status);
    map.emit({ type: 'test', status });

    return status;
  } catch (error) {
    statusSlice.set('failed');
    map.emit({ type: 'test', status: 'failed' });
    return 'failed';
  }
});

const aggregateStep: Aggregator<StepResult> = makeAggregator('step', function*(map, slice) {
  let { status, logEvents, error, timeout }: StepResultEvent = yield function*(): Operation<StepResultEvent> {
    yield spawn(function*() {
      yield map.receive('step:running');
      slice.slice('status').set('running');
      map.emit({ type: 'step', status: 'running' });
    }, { labels: { name: 'setRunning', expand: false } });

    return yield map.receive('step:result');
  }

  slice.update((s) => ({ ...s, status, logEvents, error, timeout }));
  map.emit({ type: 'step', status, logEvents, error, timeout });

  if (status === 'failed') {
    throw new Error('Step Failed');
  }

  return status;
});

const aggregateAssertion: Aggregator<AssertionResult> = makeAggregator('assertion', function*(map, slice) {
  let { status, logEvents, error, timeout }: AssertionResultEvent = yield function*(): Operation<AssertionResultEvent> {
    yield spawn(function*() {
      yield map.receive('assertion:running');
      slice.slice('status').set('running');
      map.emit({ type: 'assertion', status: 'running' });
    }, { labels: { name: 'setRunning', expand: false } });

    return yield map.receive('assertion:result');
  }

  slice.update((s) => ({ ...s, status, logEvents, error, timeout }));
  map.emit({ type: 'assertion', status, logEvents, error, timeout });

  return status;
});
