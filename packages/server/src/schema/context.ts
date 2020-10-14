import { Operation, Context, Controls } from 'effection';
import { Atom } from '@bigtest/atom';
import { RunMessage } from '../command-server';
import { resultStream } from '../result-stream';
import { TestEvent } from './test-event';
import { OrchestratorState } from '../orchestrator/state';
import { Subscribable, SymbolSubscribable } from '@effection/subscription';
import { Channel } from '@effection/channel';

let testRunIds = (function * () {
  for (let current = 1; ; current++) {
    yield `TestRun:${current}`;
  }
})();

export interface Spawner {
  spawn<T>(operation: Operation<T>): Context<T>;
}

export type SpawnContext = Context<unknown> & Spawner;

export interface RunTestOptions {
  files: string[];
}

export class GraphqlContext implements Subscribable<RunMessage, undefined> {
  private channel = new Channel<RunMessage>();
  public testRunIds = testRunIds;

  constructor(private context: SpawnContext, private atom: Atom<OrchestratorState>) {}
  
  [SymbolSubscribable]() {
    return this.channel[SymbolSubscribable]();
  }

  runTest(options: RunTestOptions): string {
    let { value: id } = this.testRunIds.next();

    this.channel.send({ type: "run", id: id, files: options.files });

    return id;
  }

  async *runTestSubscribe(options: RunTestOptions): AsyncIterator<TestEvent> {
    let id = this.runTest(options);

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
