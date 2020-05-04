import { fork, spawn, Operation } from 'effection';
import { TestResult, StepResult, AssertionResult, ResultStatus } from '@bigtest/suite';
import { Aggregator, AggregatorTestOptions } from './aggregator';
import { StepAggregator } from './step';
import { AssertionAggregator } from './assertion';

export class TestAggregator extends Aggregator<TestResult, AggregatorTestOptions> {
  *collectTestResult(): Operation<ResultStatus> {
    yield spawn(this.markRunning());

    let status: ResultStatus = 'ok';
    let forks = [];

    for (let [index, step] of this.slice.get().steps.entries()) {
      let slice = this.slice.slice<StepResult>(['steps', index]);
      let aggregator = new StepAggregator(slice, {
        ...this.options,
        path: this.options.path.concat(step.description),
      });
      forks.push(
        yield fork(aggregator.run())
      );
    }

    for (let [index, assertion] of this.slice.get().assertions.entries()) {
      let slice = this.slice.slice<AssertionResult>(['assertions', index]);
      let aggregator = new AssertionAggregator(slice, {
        ...this.options,
        path: this.options.path.concat(assertion.description),
      });
      forks.push(
        yield fork(aggregator.run())
      );
    }

    for (let [index, child] of this.slice.get().children.entries()) {
      let slice = this.slice.slice<TestResult>(['children', index]);
      let aggregator = new TestAggregator(slice, {
        ...this.options,
        path: this.options.path.concat(child.description),
      });

      forks.push(
        yield fork(aggregator.run())
      );
    }

    for (let fork of forks) {
      if((yield fork) === 'failed') {
        status = 'failed';
      }
    }

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
