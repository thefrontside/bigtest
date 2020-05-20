import { Operation, Context, contextOf } from 'effection';
import { EventEmitter } from 'events';
import { Mailbox } from '@bigtest/effection';
import { on } from '@effection/events';
import { CommandMessage } from '../command-server';
import { TestEvent } from './test-event';

let testRunIds = (function * () {
  for (let current = 1; ; current++) {
    yield `TestRun:${current}`;
  }
})();

export interface Spawner {
  spawn<T>(operation: Operation<T>): Context<T>;
}

export type SpawnContext = Context<unknown> & Spawner;

export class GraphqlContext {
  public testRunIds = testRunIds;

  constructor(private context: SpawnContext, private bus: EventEmitter, private delegate: Mailbox<CommandMessage>) {}

  runTest(): string {
    let { value: id } = this.testRunIds.next();

    this.delegate.send({ type: "run", id });

    return id;
  }

  async *runTestSubscribe(): AsyncIterator<TestEvent> {
    let id = this.runTest();

    let subscription = this.context.spawn(on(this.bus, "test:event"));
    let iterator = await subscription;

    try {
      while(true) {
        let result = await this.context.spawn(iterator.next());
        let next = result[0] as TestEvent;

        if(next.testRunId === id) {
          yield next;
          if(next.type === 'testRun:result') {
            break;
          }
        }
      }
    } finally {
      contextOf(subscription)?.halt();
    }
  }
}
