import { Operation } from 'effection';
import { lensPath, view, set, dissoc, over } from "ramda";
import { Atom } from "./atom";

export class Slice<T, S> {
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

  over(fn: (value: T) => T): void {
    this.atom.update((state) => (over(this.lens, fn, state) as unknown) as S);
  }

  slice<T>(path: Array<string | number>): Slice<T, S> {
    return new Slice(this.atom, this.path.concat(path));
  }

  once(predicate: (state: T) => boolean): Operation<void> {
    return this.atom.once(state => predicate(view(this.lens)(state) as unknown as T));
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
}
