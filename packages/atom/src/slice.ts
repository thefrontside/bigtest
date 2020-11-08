import { Operation } from "effection";
import { Option } from "fp-ts/Option";
import { ReadonlyRecord } from "fp-ts/ReadonlyRecord";
import { Lens } from "monocle-ts";
import { atReadonlyRecord } from "monocle-ts/lib/At/ReadonlyRecord";
import { subscribe, Subscribable, SymbolSubscribable, Subscription } from '@effection/subscription';
import { Sliceable } from './sliceable';
import { assert } from 'assert-ts';
import { Atom } from "./atom";

// See https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c
export type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never
};

export type AllowedNames<Base, Condition> =
  FilterFlags<Base, Condition>[keyof Base];

export interface AtRecordSlice<V, T, S> {
  <P extends AllowedNames<T, ReadonlyRecord<K, V>>, K extends string = string>(key: K, p: P): Slice<Option<V>, S>;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Slice<S, A> implements Subscribable<S, void> {
  private constructor(private atom: Atom<A>, private lens: Lens<A, S>) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromPath<S>(a: Atom<S>): Sliceable<S, any> {
    let fromProp = Lens.fromProp<S>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (...path: any[]) => {
      let lens = fromProp(path[0])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new Slice(a, path.slice(1).reduce((acc, prop) => acc.compose(fromProp(prop)), lens)) as any
    }
  }

  get state() {
    return this.atom.get();
  }

  get(): S {
    // console.log(this.state);
    return this.lens.get(this.state)
  }

  set(value: S): void {
    this.atom.update((state) => {
      return this.lens.set(value)(state);
    });
  }

  update(fn: (value: S) => S): void {
    this.set(fn(this.get()));
  }

  *once(predicate: (state: S) => boolean): Operation<S> {
    let currentState = this.get();
    if(predicate(currentState)) {
      return currentState;
    } else {
      let subscription = yield subscribe(this);
      return yield subscription.filter(predicate).expect();
    }
  }

  over(fn: (value: S) => S): void {
    this.atom.update((state) => this.lens.set(fn(this.lens.get(state)))(state));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slice: Sliceable<S, A> = <P extends keyof S>(...p: [P]): Slice<any, A> => {
    assert(Array.isArray(p) && p.length >  0, "slice expects a rest parameter with at least 1 element");

    let fromPath = Lens.fromPath<S>()(p);
    
    return new Slice(this.atom, this.lens.composeLens(fromPath));
  }

  atRecord<V>(): AtRecordSlice<V, S, A> {
    return (key, p) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let lens2: Lens<S, ReadonlyRecord<typeof key, V>> = Lens.fromProp<S>()(p) as any

      return new Slice(this.atom, this.lens
        .composeLens(lens2)
        .composeLens(atReadonlyRecord<V>().at(key))
      )
    }
  }

  *[SymbolSubscribable](): Operation<Subscription<S, void>> {
    // TODO: write test to ensure uniqueness
    return yield subscribe(this.atom).map((state) => this.lens.get(state) as unknown as S);
  }
}
