import { spawn, Operation } from 'effection';
import { TestResult, ResultStatus } from '@bigtest/suite';
import { Aggregator, AggregatorTestOptions } from './aggregator';
import { StepAggregator } from './step';
import { AssertionAggregator } from './assertion';
import { parallel } from './parallel';

export class TestAggregator extends Aggregator<TestResult, AggregatorTestOptions> {
  *collectTestResult(): Operation<ResultStatus> {
    yield spawn(this.markRunning());

    let results = [...this.slice.get().steps.entries()].map(([index, step]) => {
      let slice = this.slice.slice()('steps', index);

      return new StepAggregator(slice, {
        ...this.options,
        path: this.options.path.concat(`${index}:${step.description}`),
      }).run();
    }).concat([...this.slice.get().assertions.entries()].map(([index, assertion]) => {
      let slice = this.slice.slice()('assertions', index);

      return new AssertionAggregator(slice, {
        ...this.options,
        path: this.options.path.concat(assertion.description),
      }).run();
    })).concat([...this.slice.get().children.entries()].map(([index, child]) => {
      let slice = this.slice.slice()('children', index);

      return new TestAggregator(slice, {
        ...this.options,
        path: this.options.path.concat(child.description),
      }).run();
    }));

    let statuses: ResultStatus[] = yield parallel(results);
    let status: ResultStatus = statuses.some(result => result === 'failed') ? 'failed' : 'ok';

    return status;
  }

  *markRunning(): Operation<void> {
    yield this.events.receive({
      type: 'test:running',
      agentId: this.options.agentId,
      testRunId: this.options.testRunId,
      path: this.options.path
    });
    this.statusSlice.set('running');
  }

  *perform(): Operation<ResultStatus> {
    try {
      let status: ResultStatus = yield this.collectTestResult();

      this.statusSlice.set(status);

      return status;
    } catch (error) {
      this.statusSlice.set('failed');
      return 'failed';
    }
  }
}
