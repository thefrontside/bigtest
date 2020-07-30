import { Operation, fork } from 'effection';
import { Slice } from '@bigtest/atom';
import { subscribe, Subscription, createSubscription } from '@effection/subscription';
import { TestResult, StepResult, AssertionResult, ResultStatus } from '@bigtest/suite';
import { AgentState, OrchestratorState, TestRunState, TestRunAgentState } from './orchestrator/state';
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
  path?: string[];
}

export interface StreamerAgentOptions extends StreamerOptions {
  agentId: string;
}

export interface StreamerTestOptions extends StreamerAgentOptions {
  path: string[];
}

type StreamResult =
  { type: 'testRun'; slice: Slice<TestRunState, OrchestratorState> } |
  { type: 'testRunAgent'; slice: Slice<TestRunAgentState, OrchestratorState> } |
  { type: 'test'; slice: Slice<TestResult & { agentId: string}, OrchestratorState> } |
  { type: 'step'; slice: Slice<StepResult & { agentId: string}, OrchestratorState> } |
  { type: 'assertion'; slice: Slice<AssertionResult & { agentId: string}, OrchestratorState> }


function* streamResults(result: StreamResult, publish: Publish, options: StreamerOptions): Operation<void> {
  let statusSlice = result.slice.slice<ResultStatus>(['status']);
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
          type: `${result.type}:running`,
          ...options,
        } as TestEvent);
      } else {
        let agents: AgentState[] = [];
        let agent = undefined;

        if (result.type === 'testRun') {
          agents = Object.values(result.slice.get().agents).map(state => state.agent);
        } else if (result.type == 'testRunAgent') {
          agent = result.slice.get().agent;
        } else {
          let agentOptions = options as StreamerAgentOptions;
          agent = result.slice.state.agents[agentOptions.agentId];
        }
        
        publish({
          type: `${result.type}:result`,
          status: status,
          agents: agents,
          agent,
          error: result.type === 'step' || result.type === 'assertion' ? result.slice.get().error : null,
          timeout: result.type === 'step' || result.type === 'assertion' ? result.slice.get().timeout : null,
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
    let testRunAgentSlice = slice.slice<TestRunAgentState>(['agents', agentId]);
    yield fork(streamTestRunAgent(testRunAgentSlice, publish, { agentId, ...options }));
  };
  yield streamResults({type: 'testRun', slice}, publish, options);
}

function* streamTestRunAgent(slice: Slice<TestRunAgentState, OrchestratorState>, publish: Publish, options: StreamerAgentOptions): Operation<void> {
  let testResultSlice = slice.slice<TestResult & { agentId: string }>(['result']);

  yield fork(streamTest(testResultSlice, publish, {
    ...options,
    path: [testResultSlice.get().description],
  }));
  yield streamResults({type: 'testRunAgent', slice}, publish, options);
}

function* streamTest(slice: Slice<TestResult & { agentId: string}, OrchestratorState>, publish: Publish, options: StreamerTestOptions): Operation<void> {
  for(let [index, step] of Object.entries(slice.get().steps)) {
    let stepSlice = slice.slice<StepResult & { agentId: string }>(['steps', index]);
    yield fork(streamStep(stepSlice, publish, {
      ...options,
      path: options.path.concat(step.description),
    }));
  }
  for(let [index, assertion] of Object.entries(slice.get().assertions)) {
    let assertionSlice = slice.slice<AssertionResult & { agentId: string }>(['assertions', index]);
    yield fork(streamAssertion(assertionSlice, publish, {
      ...options,
      path: options.path.concat(assertion.description),
    }));
  }
  for(let [index, child] of Object.entries(slice.get().children)) {
    let childSlice = slice.slice<TestResult & { agentId: string }>(['children', index]);
    yield fork(streamTest(childSlice, publish, {
      ...options,
      path: options.path.concat(child.description),
    }));
  }
  yield streamResults({type: 'test', slice}, publish, options);
}

function* streamStep(slice: Slice<StepResult & { agentId: string }, OrchestratorState>, publish: Publish, options: StreamerTestOptions): Operation<void> {
  yield streamResults({type: 'step', slice}, publish, options)
}

function* streamAssertion(slice: Slice<AssertionResult & { agentId: string }, OrchestratorState>, publish: Publish, options: StreamerTestOptions): Operation<void> {
  yield streamResults({type: 'assertion', slice}, publish, options)
}
