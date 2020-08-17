import { Operation, Context, Controls } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { Atom } from '@bigtest/atom';
import { CommandMessage } from '../command-server';
import { resultStream } from '../result-stream';
import { TestEvent } from './test-event';
import { OrchestratorState } from '../orchestrator/state';

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

  constructor(private context: SpawnContext, private atom: Atom<OrchestratorState>, private delegate: Mailbox<CommandMessage>) {}

  runTest(): string {
    let { value: id } = this.testRunIds.next();

    this.delegate.send({ type: "run", id });

    return id;
  }

  async *runTestSubscribe(): AsyncIterator<TestEvent> {
    let id = this.runTest();

    let slice = this.atom.slice('testRuns', id);

    let scope = this.context.spawn(undefined) as Context & Controls;

    let subscription = await scope.spawn(resultStream(id, slice))

    try {
      while(true) {
        let iter = await this.context.spawn(subscription.next());
        if(iter.done) {
          break;
        } else {
          yield iter.value;
        }
      }
    } finally {
      scope.halt();
    }
  }
}
