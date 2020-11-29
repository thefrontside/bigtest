import * as O from "fp-ts/Option";
import { Lens } from "monocle-ts";
import { constant, identity } from 'fp-ts/lib/function';
import { pipe } from 'fp-ts/function'
import { Atom, Sliceable } from './sliceable';
import { assert } from 'assert-ts';
import { subscribe, Subscription, SymbolSubscribable } from '@effection/subscription';
import { Channel } from '@effection/channel';
import { Operation } from 'effection';
import { atRecord } from 'monocle-ts/lib/At';
import { cons } from 'fp-ts/lib/NonEmptyArray';
// import { Operation } from 'effection';
// import { unique } from './unique';

export function createAtom<S>(init?: S): Atom<S> {
  let initialState = init;
  let state = init;
  let lens = new Lens<S, S>(identity, constant);
  let states = new Channel<S>();

  function get(): S | undefined {
    let current = pipe(
      state,
      O.fromNullable,
      O.map(state => lens.get(state)),
      O.toUndefined
    );

    return current;
  }

  function set(value: S): void {
    state = pipe(
      get(),
      O.fromNullable,
      O.map(state => lens.asOptional().set(value)(state)),
      O.toUndefined
    ) as S;

    if(state) {
       states.send(state);
     }
  }

  function update(fn: (state: S) => S) {
    pipe(
      get(),
      O.fromNullable,
      O.map(state => fn(state)),
      O.map(state => set(state))
    );
  }

  function *once(predicate: (state: S) => boolean): Operation<S> {
    if(predicate(state as S)) {
      return state;
    } else {
      let subscription = yield subscribe(states);
      return yield subscription.filter(predicate).expect();
    }
  }

  function reset(initializer?: (initial: S, curr: S) => S) {
    if (!initializer) {
      initializer = (initial) => initial;
    }
    states.close();
    set(initializer(initialState as S, state as S));
  }

  function setMaxListeners(value: number) {
    states.setMaxListeners(value);
  }

  let sliceMaker = (parentLens: Lens<S, S>) => (): Sliceable<S> => <P extends keyof S>(...path: P[]) => {
    assert(Array.isArray(path) && path.length >  0, "slice expects a rest parameter with at least 1 element");
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sliceLens = parentLens.compose(Lens.fromPath<S>()(path as any) as any);

    let slice = {
      get(): S | undefined {
        return pipe(
          get(),
          O.fromNullable,
          O.map(s => sliceLens.get(s)),
          O.toUndefined
        ) as S;
      },
      set(value: S): void {
        let next = pipe(
          get(),
          O.fromNullable,
          O.map(s => sliceLens.asOptional().modify(() => value)(s as S)),
          O.toUndefined
        );

        set(next as S);
      },
      update(fn: (s: S) => S) {
        let next = pipe(
          get(),
          O.fromNullable,
          O.map(s => {
            let updated = fn(sliceLens.get(get() as S) as S);
            
            return sliceLens.asOptional().modify(() => updated)(s as S);
          }),
          O.toUndefined
        );

        set(next as S);
      },
      remove() {
        let next = pipe(
          get(),
          O.fromNullable,
          O.map(s => sliceLens.asOptional().modify(() => undefined)(s as S)),
          O.toUndefined
        );

        set(next as S);
      },
      slice: sliceMaker(sliceLens as Lens<S, S>),
      *[SymbolSubscribable](): Operation<Subscription<S, void>> {
        return yield subscribe(atom).map((s) => sliceLens.get(s));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    slice.once = function *(predicate: (state: S) => boolean): Operation<S> {
      let currentState = sliceLens.get(get() as S);
      if(predicate(currentState as S)) {
        return currentState;
      } else {
        let subscription = yield subscribe(slice);
        return yield subscription.filter(predicate).expect();
      }
    }

    return slice;
  }

  let atom = ({
    get,
    set,
    update,
    slice: sliceMaker(lens),
    once,
    reset,
    setMaxListeners,
    *[SymbolSubscribable](): Operation<Subscription<S,undefined>> {
      return yield subscribe(states);
    }
  } as const);

  return atom as Atom<S>;
}