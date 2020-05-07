import { Operation } from 'effection';
import { ResultStatus } from '@bigtest/suite';
import { TestRunState, TestRunAgentState } from '../orchestrator/state';
import { Aggregator, AggregatorOptions } from './aggregator';
import { TestRunAgentAggregator } from './test-run-agent';
import { parallel } from './parallel';

export class TestRunAggregator extends Aggregator<TestRunState, AggregatorOptions> {
  *perform(): Operation<ResultStatus> {
    let agentRuns = Object.keys(this.slice.get().agents).map(agentId => {
      let testRunAgentSlice = this.slice.slice<TestRunAgentState>(['agents', agentId]);

      return new TestRunAgentAggregator(testRunAgentSlice, { agentId, ...this.options }).run();
    });

    let statuses: ResultStatus[] = yield parallel(agentRuns);

    this.statusSlice.set(statuses.some(status => status === 'failed') ? 'failed' : 'ok');

    return this.statusSlice.get();
  }
}
