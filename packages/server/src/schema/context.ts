import { TestEvent } from './test-event';
import { Runner } from '../runner';

let testRunIds = (function* () {
  for (let current = 1; ; current++) {
    yield `TestRun:${current}`;
  }
})();

export interface RunTestOptions {
  files: string[];
}

export class GraphqlContext {
  public testRunIds = testRunIds;

  constructor(private runner: Runner) {}

  runTest(options: RunTestOptions): string {
    let { value: id } = this.testRunIds.next();

    this.runner.runTest({ testRunId: id, files: options.files });

    return id;
  }

  runTestSubscribe(options: RunTestOptions): AsyncIterator<TestEvent> {
    let { value: id } = this.testRunIds.next();

    let iterator = this.runner.subscribe(id);
    this.runner.runTest({ testRunId: id, files: options.files });
    return iterator;
  }
}
