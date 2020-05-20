import { Mailbox } from '@bigtest/effection';
import { CommandMessage } from '../command-server';
import { TestEvent } from './test-event';

let testRunIds = (function * () {
  for (let current = 1; ; current++) {
    yield `TestRun:${current}`;
  }
})();

export class GraphqlContext {
  public testRunIds = testRunIds;

  constructor(public delegate: Mailbox<CommandMessage>) {}

  runTest(): string {
    let { value: id } = this.testRunIds.next();

    this.delegate.send({ type: "run", id });

    return id;
  }
}
