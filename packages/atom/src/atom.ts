import { EventEmitter } from "events";
import { Operation } from "effection";
import { on } from '@effection/events';
import { Subscribable, SymbolSubscribable, createSubscription, forEach } from '@effection/subscription';
import { Slice } from "./slice";

export class Atom<S> implements Subscribable<S,void> {
  initial: S;
  state: S;

  subscriptions = new EventEmitter();

  get(): S {
    return this.state;
  }

  constructor(initial: S) {
    this.initial = this.state = initial;
  }

  reset(initializer?: (initial: S, current: S) => S) {
    if (!initializer) {
      initializer = (initial) => initial;
    }
    this.state = initializer(this.initial, this.state);
    this.subscriptions.removeAllListeners();
  }

  update(fn: (state: S) => S) {
    this.state = fn(this.get());
    this.subscriptions.emit("state", this.state);
  }

  slice<T>(path: string[]): Slice<T, S> {
    return new Slice(this, path);
  }

  each(fn: (state: S) => Operation<void>): Operation<void> {
    return forEach(this, fn);
  }

  once(predicate: (state: S) => boolean): Operation<S | undefined> {
    return Subscribable.from(this).filter(predicate).first();
  }

  [SymbolSubscribable]() {
    let { subscriptions } = this;

    return createSubscription<S,void>(function*(publish) {
      let events = yield on(subscriptions, 'state');
      while (true) {
        let { value: [state] } = yield events.next();
        publish(state as S);
      }
    })
  }
}
