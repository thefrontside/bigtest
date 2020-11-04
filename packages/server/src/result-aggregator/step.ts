import { spawn, Operation } from 'effection';
import { StepResult, ResultStatus } from '@bigtest/suite';
import { StepResult as StepResultEvent } from '@bigtest/agent';
import { Aggregator, AggregatorTestOptions } from './aggregator';

export class StepAggregator extends Aggregator<StepResult, AggregatorTestOptions> {
  *markRunning(): Operation<void> {
    yield this.agents.match({
      type: 'step:running',
      agentId: this.options.agentId,
      testRunId: this.options.testRunId,
      path: this.options.path
    }).expect();
    this.statusSlice.set('running');
  }

  *receiveResult(): Operation<StepResultEvent> {
    yield spawn(this.markRunning());
    return yield this.agents.match({
      type: 'step:result',
      agentId: this.options.agentId,
      testRunId: this.options.testRunId,
      path: this.options.path
    }).expect();
  }

  *perform(): Operation<ResultStatus> {
    let result: StepResultEvent = yield this.receiveResult();

    this.slice.update((s) => ({ ...s, ...result }));

    if (result.status === 'failed') {
      throw new Error('Step Failed');
    }

    return result.status;
  }
}
