import { EventEmitter } from "events";
import { Operation } from "effection";
import { Mailbox } from "@bigtest/effection";
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

  *each(fn: (state: S) => Operation) {
    let mailbox = yield Mailbox.subscribe(this.subscriptions, "state");

    while (true) {
      let {
        args: [state],
      } = yield mailbox.receive();
      yield fn(state);
    }
  }
}
