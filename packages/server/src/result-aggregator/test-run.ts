import { fork, Operation } from 'effection';
import { ResultStatus } from '@bigtest/suite';
import { TestRunState, TestRunAgentState } from '../orchestrator/state';
import { Aggregator, AggregatorOptions } from './aggregator';
import { TestRunAgentAggregator } from './test-run-agent';

export class TestRunAggregator extends Aggregator<TestRunState, AggregatorOptions> {
  *perform(): Operation<ResultStatus> {
    let status: ResultStatus = 'ok';
    let forks = [];

    for(let agentId of Object.keys(this.slice.get().agents)) {
      let testRunAgentSlice = this.slice.slice<TestRunAgentState>(['agents', agentId]);

      let aggregator = new TestRunAgentAggregator(testRunAgentSlice, { agentId, ...this.options });

      forks.push(yield fork(aggregator.run()));
    }

    for(let fork of forks) {
      if((yield fork) === 'failed') {
        status = 'failed';
      }
    }

    this.statusSlice.set(status);

    return status;
  }
}
