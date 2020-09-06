import { Operation } from "effection";
import { Channel } from '@effection/channel';
import { subscribe, Subscribable, SymbolSubscribable, Subscription } from '@effection/subscription';
import { Slice } from "./slice";
import { Sliceable } from './sliceable';
import { equals } from 'ramda';

export class Atom<S> implements Subscribable<S,undefined> {
  private readonly initial: S;
  private state: S;
  private states = new Channel<S>();

  constructor(initial: S) {
    this.initial = this.state = initial;
  }

  setMaxListeners(value: number) {
    this.states.setMaxListeners(value);
  }

  get(): S {
    return this.state;
  }

  set(value: S) {
    // need to use a deep equality check on the object's values
    // because this.state and value
    // will always be 2 different objects but will often have the 
    // same values
    if (equals(this.state, value)) {
      return;
    }
    this.state = value;
    this.states.send(value);
  }

  update(fn: (state: S) => S) {
    this.set(fn(this.get()));
  }

  *once(predicate: (state: S) => boolean): Operation<S | undefined> {
    if(predicate(this.state)) {
      return this.state;
    } else {
      let subscription = yield subscribe(this.states);
      return yield subscription.filter(predicate).first();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slice: Sliceable<S, S>['slice'] = (...keys: string[]): Slice<any, S> => {
    return new Slice(this, keys);
  }

  reset(initializer?: (initial: S, current: S) => S) {
    if (!initializer) {
      initializer = (initial) => initial;
    }
    this.states.close();
    this.set(initializer(this.initial, this.state));
  }

  *[SymbolSubscribable](): Operation<Subscription<S,undefined>> {
    return yield subscribe(this.states);
  }
}
