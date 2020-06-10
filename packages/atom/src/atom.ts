import { EventEmitter } from "events";
import { Operation } from "effection";
import { on } from '@effection/events';
import { Subscribable, SymbolSubscribable } from '@effection/subscription';
import { Slice } from "./slice";

export class Atom<S> implements Subscribable<S,void> {
  initial: S;
  state: S;

  subscriptions = new EventEmitter();

  get states() {
    return Subscribable.from(on(this.subscriptions, 'state'))
      .map(([state]) => state as S);
  }

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
    return this.states.forEach(fn);
  }

  once(predicate: (state: S) => boolean): Operation<S | undefined> {
    return this.states.filter(predicate).first();
  }

  setMaxListeners(value: number) {
    this.subscriptions.setMaxListeners(value);
  }

  [SymbolSubscribable]() {
    return this.states[SymbolSubscribable]();
  }
}
