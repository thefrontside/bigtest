import { Operation } from 'effection';
import { ResultStatus } from '@bigtest/suite';
import { TestRunState } from '../orchestrator/state';
import { Aggregator, AggregatorOptions } from './aggregator';
import { TestRunAgentAggregator } from './test-run-agent';
import { parallel } from './parallel';
import { createCoverageMap, CoverageMap, CoverageMapData } from 'istanbul-lib-coverage';

export class TestRunAggregator extends Aggregator<TestRunState, AggregatorOptions> {
  *perform(): Operation<ResultStatus> {
    let agentRuns = Object.keys(this.slice.get().agents).map(agentId => {
      let testRunAgentSlice = this.slice.slice('agents', agentId);

      return new TestRunAgentAggregator(testRunAgentSlice, { agentId, ...this.options }).run();
    });

    let statuses: ResultStatus[] = yield parallel(agentRuns);
    let status: ResultStatus = statuses.some(status => status === 'failed') ? 'failed' : 'ok';

    let coverage = Object.values(this.slice.get().agents)
      .filter(agent => !!agent.coverage)
      .map(agent => agent.coverage as CoverageMapData)
      .reduce((current: CoverageMap | undefined, data) => {
        if (!current) {
          return createCoverageMap(data);
        } else {
          current.merge(data);
          return current;
        }
      }, undefined);

    this.slice.update(state => ({ ...state, status, coverage }));
    return status;
  }
}
