import { Operation } from "effection";
import { Channel } from '@effection/channel';
import { subscribe, Subscribable, SymbolSubscribable, Subscription } from '@effection/subscription';
import { Slice } from "./slice";

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


  slice<Key extends keyof S>(key: Key): Slice<S[Key], S>;
  slice<Key1 extends keyof S, Key2 extends keyof S[Key1]>(key1: Key1, key2: Key2): Slice<S[Key1][Key2], S>;
  slice<Key1 extends keyof S, Key2 extends keyof S[Key1], Key3 extends keyof S[Key1][Key2]>(key1: Key1, key2: Key2, key3: Key3): Slice<S[Key1][Key2][Key3], S>;
  slice<Key1 extends keyof S, Key2 extends keyof S[Key1], Key3 extends keyof S[Key1][Key2], Key4 extends keyof S[Key1][Key2][Key3]>(key1: Key1, key2: Key2, key3: Key3, key4: Key4): Slice<S[Key1][Key2][Key3][Key4], S>;
  slice<Key1 extends keyof S, Key2 extends keyof S[Key1], Key3 extends keyof S[Key1][Key2], Key4 extends keyof S[Key1][Key2][Key3], Key5 extends keyof S[Key1][Key2][Key3][Key4]>(key1: Key1, key2: Key2, key3: Key3, key4: Key4, key5: Key5): Slice<S[Key1][Key2][Key3][Key4][Key5], S>;
  slice<Key1 extends keyof S, Key2 extends keyof S[Key1], Key3 extends keyof S[Key1][Key2], Key4 extends keyof S[Key1][Key2][Key3], Key5 extends keyof S[Key1][Key2][Key3][Key4], Key6 extends keyof S[Key1][Key2][Key3][Key4][Key5]>(key1: Key1, key2: Key2, key3: Key3, key4: Key4, key5: Key5): Slice<S[Key1][Key2][Key3][Key4][Key5][Key6], S>;
  slice(...keys: string[]): Slice<any, S> {
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
