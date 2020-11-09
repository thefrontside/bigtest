import { Operation } from "effection";
import { Lens } from "monocle-ts";
import { subscribe, Subscribable, SymbolSubscribable, Subscription } from '@effection/subscription';
import { Sliceable } from './sliceable';
import { assert } from 'assert-ts';
import { Atom } from "./atom";


export class Slice<S, A> implements Subscribable<S, void> {
  private constructor(private atom: Atom<A>, private lens: Lens<A, S>) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromPath<S, A>(a: Atom<S>): Sliceable<S, A> {
    return <P extends keyof S>(...path: [P]) => {
      let lens = Lens.fromPath<S>()(path);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new Slice(a, lens) as any;
    }
  }

  get state() {
    return this.atom.get();
  }

  get(): S {
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

  over(fn: (value: S) => S): void {
    this.atom.update((state) => this.lens.set(fn(this.lens.get(state)))(state));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slice: Sliceable<S, A> = <P extends keyof S>(...path: [P]): Slice<any, A> => {
    assert(Array.isArray(path) && path.length >  0, "slice expects a rest parameter with at least 1 element");

    let fromPath = Lens.fromPath<S>()(path);
    
    return new Slice(this.atom, this.lens.composeLens(fromPath));
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

  *[SymbolSubscribable](): Operation<Subscription<S, void>> {
    return yield subscribe(this.atom).map((state) => this.lens.get(state));
  }
}
