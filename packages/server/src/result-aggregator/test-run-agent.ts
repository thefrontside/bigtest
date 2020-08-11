import { spawn, Operation } from 'effection';
import { ResultStatus } from '@bigtest/suite';
import { TestRunAgentState } from '../orchestrator/state';
import { Aggregator, AggregatorAgentOptions } from './aggregator';
import { TestAggregator } from './test';

export class TestRunAgentAggregator extends Aggregator<TestRunAgentState, AggregatorAgentOptions> {
  *markRunning(): Operation<void> {
    yield this.events.receive({
      type: 'run:begin',
      agentId: this.options.agentId,
      testRunId: this.options.testRunId,
    });
    this.statusSlice.set('running');
  }

  *perform(): Operation<ResultStatus> {
    let testResultSlice = this.slice.slice('result');

    let aggregator = new TestAggregator(testResultSlice, {
      ...this.options,
      path: [testResultSlice.get().description],
    });

    yield spawn(this.markRunning());

    let result = yield aggregator.run();

    this.statusSlice.set(result);

    return result;
  }
}
