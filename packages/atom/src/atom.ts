import { EventEmitter } from "events";
import { Operation } from "effection";
import { on } from '@effection/events';
import { Slice } from "./slice";

export class Atom<S> {
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

  *each(fn: (state: S) => Operation): Operation {
    let subscription = yield on(this.subscriptions, 'state');

    while (true) {
      let [state] = yield subscription.next();
      yield fn(state);
    }
  }

  *once(predicate: (state: S) => boolean): Operation<void> {
    let subscription = yield on(this.subscriptions, 'state');
    while (!predicate(this.state)) {
      yield subscription.next();
    }
  }
}
