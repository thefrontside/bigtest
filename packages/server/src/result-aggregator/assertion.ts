import { spawn, Operation } from 'effection';
import { AssertionResult, ResultStatus } from '@bigtest/suite';
import { AssertionResult as AssertionResultEvent } from '@bigtest/agent';
import { Aggregator, AggregatorTestOptions } from './aggregator';

export class AssertionAggregator extends Aggregator<AssertionResult, AggregatorTestOptions> {
  *markRunning(): Operation<void> {
    yield this.events.receive({
      type: 'assertion:running',
      agentId: this.options.agentId,
      testRunId: this.options.testRunId,
      path: this.options.path
    });
    this.statusSlice.set('running');
  }

  *receiveResult(): Operation<AssertionResultEvent> {
    yield spawn(this.markRunning());
    return yield this.events.receive({
      type: 'assertion:result',
      agentId: this.options.agentId,
      testRunId: this.options.testRunId,
      path: this.options.path
    });
  }

  *perform(): Operation<ResultStatus> {
    let result: AssertionResultEvent = yield this.receiveResult();

    this.statusSlice.set(result.status);

    return result.status;
  }
}

