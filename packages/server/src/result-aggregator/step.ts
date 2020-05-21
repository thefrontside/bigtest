import { spawn, Operation } from 'effection';
import { StepResult, ResultStatus } from '@bigtest/suite';
import { StepResult as StepResultEvent } from '@bigtest/agent';
import { Aggregator, AggregatorTestOptions } from './aggregator';

export class StepAggregator extends Aggregator<StepResult, AggregatorTestOptions> {
  *markRunning(): Operation<void> {
    yield this.events.receive({
      type: 'step:running',
      agentId: this.options.agentId,
      testRunId: this.options.testRunId,
      path: this.options.path
    });
    this.statusSlice.set('running');
  }

  *receiveResult(): Operation<StepResultEvent> {
    yield spawn(this.markRunning());
    return yield this.events.receive({
      type: 'step:result',
      agentId: this.options.agentId,
      testRunId: this.options.testRunId,
      path: this.options.path
    });
  }

  *perform(): Operation<ResultStatus> {
    let result: StepResultEvent = yield this.receiveResult();

    this.statusSlice.set(result.status);

    this.options.bus.emit("test:event", {
      type: "step:result",
      path: this.options.path,
      status: this.statusSlice.get(),
      testRunId: this.options.testRunId,
      agentId: this.options.agentId
    });

    if (result.status === 'failed') {
      throw new Error('Step Failed');
    }

    return result.status;
  }
}
