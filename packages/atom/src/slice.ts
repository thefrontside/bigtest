import { Operation } from "effection";
import { lensPath, view, set, dissoc, over } from "ramda";
import { Atom } from "./atom";
import { subscribe, Subscribable, SymbolSubscribable, Subscription } from '@effection/subscription';

export class Slice<T, S> implements Subscribable<T, undefined> {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  lens: any;

  constructor(private atom: Atom<S>, public path: Array<string | number>) {
    this.lens = lensPath(path);
  }

  get state() {
    return this.atom.get();
  }

  get(): T {
    return (view(this.lens)(this.state) as unknown) as T;
  }

  set(value: T): void {
    this.atom.update((state) => {
      return (set(this.lens, value, state) as unknown) as S;
    });
  }

  update(fn: (value: T) => T): void {
    this.set(fn(this.get()));
  }

  over(fn: (value: T) => T): void {
    this.atom.update((state) => (over(this.lens, fn, state) as unknown) as S);
  }

  slice<T>(path: Array<string | number>): Slice<T, S> {
    return new Slice(this.atom, this.path.concat(path));
  }

  remove(): void {
    // If this is the root, then it cannot be removed.
    if (this.path.length === 0) {
      return;
    }

    let parentPath = this.path.slice(0, -1);
    let parentLens = lensPath(parentPath);
    let parent = view(parentLens, this.state);
    if (Array.isArray(parent)) {
      this.atom.update((state) => {
        let array = parent as unknown[];
        return (set(
          parentLens,
          array.filter((el) => el !== this.get()),
          state
        ) as unknown) as S;
      });
    } else {
      let [property] = this.path.slice(-1);
      this.atom.update((state) => {
        return (set(
          parentLens,
          dissoc(property, parent as object),
          state
        ) as unknown) as S;
      });
    }
  }

  *once(predicate: (state: T) => boolean): Operation<T | undefined> {
    let currentState = this.get();
    if(predicate(currentState)) {
      return currentState;
    } else {
      let subscription = yield subscribe(this);
      return yield subscription.filter(predicate).first();
    }
  }

  *[SymbolSubscribable](): Operation<Subscription<T, undefined>> {
    return yield subscribe(Subscribable.from(this.atom).map((state) => view(this.lens)(state) as unknown as T));
  }
}
