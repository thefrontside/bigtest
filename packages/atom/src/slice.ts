import { Operation } from "effection";
import { Lens } from "monocle-ts";
import * as O from 'fp-ts/Option';
import { subscribe, Subscribable, SymbolSubscribable, Subscription } from '@effection/subscription';
import { Sliceable } from './sliceable';
import { assert } from 'assert-ts';
import { Atom } from "./atom";
import { atRecord } from 'monocle-ts/lib/At/Record';


export class Slice<S, A extends Record<string, unknown>> implements Subscribable<S, void> {
  private constructor(private atom: Atom<A>, private lens: Lens<A, S>, private path: (keyof A)[]) {}

static fromPath<S, A extends Record<string, unknown>>(a: Atom<A>): Sliceable<S, A> {
  return <P extends keyof A>(...path: [P]) => {
    let lens = Lens.fromPath<A>()(path);
    // TODO: should be a keyof constraint
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Slice(a, lens as any, path as any) as any;
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

  remove(): void {
    assert(this.path.length > 1, "invalid path in Slice#remove");

    let parentPath = this.path.slice(0, -1);
    let prop = this.path.slice(-1)[0] as string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parentLens = Lens.fromPath<any>()(parentPath as [keyof A]);

    let current = parentLens.compose(atRecord<S>().at(prop as string));

    let nextState = current.set(O.none)(this.state);

    this.atom.set(nextState);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slice: Sliceable<S, A> = <P extends keyof S>(...path: [P]): Slice<any, A> => {
    assert(Array.isArray(path) && path.length >  0, "slice expects a rest parameter with at least 1 element");

    let fromPath = Lens.fromPath<S>()(path);

    return new Slice(this.atom, this.lens.composeLens(fromPath), [...this.path, ...path] as (keyof A)[]);
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
