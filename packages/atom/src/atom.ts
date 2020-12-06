import * as O from "fp-ts/Option";
import * as Op from "monocle-ts/lib/Optional"
import { pipe } from 'fp-ts/function'
import { subscribe, Subscription, SymbolSubscribable } from '@effection/subscription';
import { Channel } from '@effection/channel';
import { Operation } from 'effection';
import { Atom, Sliceable } from './sliceable';
import assert = require('assert');

export function createAtom<S>(init?: S): Atom<S> {
  let initialState = init;
  let state = init as S;
  let lens = Op.id<S>();
  let states = new Channel<S>();

  function get(): S {
    let current = pipe(
      state,
      lens.getOption,
      O.toUndefined
    );

    return current as S;
  }

  function set(value: S): void {
    let current = get();

    if(value === current) {
      return;
    }

    state = pipe(
      current,
      lens.set(value)
    );

    if(state) {
      states.send(state);
    }
  }

  function update(fn: (s: S) => S) {
    let next = pipe(
      get(),
      fn,
      lens.getOption,
      O.toUndefined
    );

    set(next as S);
  }

  function *once(predicate: (state: S) => boolean): Operation<S> {
    if(predicate(state as S)) {
      return state as S;
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
    set(initializer(initialState as S, get()));
  }

  function setMaxListeners(value: number) {
    states.setMaxListeners(value);
  }

  let sliceMaker = <A>(parentOptional: Op.Optional<S, S>) => (): Sliceable<S> => (...path: PropertyKey[]) => {
    assert(Array.isArray(path) && path.length >  0, "slice expects a rest parameter with at least 1 element");

    let getters = path.map(p => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (typeof p === 'number') ? Op.index(p) : Op.prop<S, any>(p as any);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sliceOptional = (pipe as any)(...[parentOptional, ...getters]) as Op.Optional<S, A>;

    function getter(): A {
      let current = pipe(
        get(),
        sliceOptional.getOption,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        O.toUndefined as any
      );

      return current as A;
    }

    function setter(value: A): void {
      let next = pipe(
        get(),
        sliceOptional.set(value)
      );

      set(next);
    }

    function updater(fn: (s: A) => A) {
      let next = pipe(
        sliceOptional,
        Op.modify(fn)
      )(get());
    
      set(next);
    }

    function remover() {
      let next = pipe(
        sliceOptional,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Op.modify(() => undefined as any),
      )(get());

      set(next);
    }

    let slice = {
      get: getter,
      set: setter,
      update: updater,
      remove: remover,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      slice: sliceMaker(sliceOptional as any),

      // over(fn: (value: S) => S): void {
      //   update((s) => sliceLens.set(fn(sliceLens.get(s) as S))(get() as S));
      // },
      // *[SymbolSubscribable](): Operation<Subscription<S, void>> {
      //   // eslint-disable-next-line @typescript-eslint/no-use-before-define
      //   return yield subscribe(atom).map((s) => sliceLens.get(s));
      // }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    // slice.once = function *(predicate: (state: S) => boolean): Operation<S> {
    //   let currentState = sliceLens.get(get() as S);
    //   if(predicate(currentState as S)) {
    //     return currentState as S;
    //   } else {
    //     let subscription = yield subscribe(slice);
    //     return yield subscription.filter(predicate).expect();
    //   }
    // }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  return atom;
}