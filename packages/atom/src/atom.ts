// import { Operation } from "effection";
// import { Channel } from '@effection/channel';
// import { subscribe, Subscribable, SymbolSubscribable, Subscription } from '@effection/subscription';
// import { Slice } from "./slice";
// import { Sliceable } from './sliceable';
// import { unique } from './unique';
import * as O from "fp-ts/Option";
import { Lens } from "monocle-ts";
// import { Sliceable } from './sliceable';
// import { assert } from 'assert-ts';
import { constant, identity } from 'fp-ts/lib/function';
import { pipe } from 'fp-ts/function'
import { Slice, Sliceable } from './sliceable';
import { assert } from 'assert-ts';
// import { Channel } from '@effection/channel';
import { subscribe, Subscription, SymbolSubscribable } from '@effection/subscription';
import { Channel } from '@effection/channel';
import { Operation } from 'effection';
// import { Operation } from 'effection';
// import { unique } from './unique';
// import { State } from 'fp-ts/lib/State';

export function createAtom<S>(init?: S): Slice<S> {
  let state = init;
  let lens = new Lens<S, S>(identity, constant);
  let states = new Channel<S>();

  function get(): S | undefined {
    return pipe(
      state,
      O.fromNullable,
      O.map(state => lens.get(state)),
      O.toUndefined
    );
  }

  function set(value: S): void {
    state = pipe(
      state,
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

  function slice(): Sliceable<S> {
    return <P extends keyof S>(...path: P[]) => {
      assert(Array.isArray(path) && path.length >  0, "slice expects a rest parameter with at least 1 element");
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let sliceLens = lens.compose(Lens.fromPath<S>()(path as any) as any);

      return {
        get(): S | undefined {
          return pipe(
            state,
            O.fromNullable,
            O.map(s => sliceLens.get(s)),
            O.toUndefined
          ) as S;
        },
        set(value: S): void {
          state = pipe(
            state,
            O.fromNullable,
            O.map(s => sliceLens.asOptional().set(value)(s)),
            O.toUndefined
          ) as S;
        },
        update(fn: (s: S) => S) {
          pipe(
            get(),
            O.fromNullable,
            O.map(s => fn(s)),
            O.map(s => set(s))
          );
        },
        slice(): Sliceable<S> {
          return slice();
        },
        *[SymbolSubscribable](): Operation<Subscription<S, void>> {
          return yield subscribe(atom).map((s) => sliceLens.get(s));
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    }
  }

  let atom = ({
    get,
    set,
    update,
    slice,
    once,
    *[SymbolSubscribable](): Operation<Subscription<S,undefined>> {
      return yield subscribe(states);
    }
  } as const);

  return atom as Slice<S>;
}