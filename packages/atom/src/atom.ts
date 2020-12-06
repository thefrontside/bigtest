import * as O from "fp-ts/Option";
import * as Op from "monocle-ts/lib/Optional"
import { pipe } from 'fp-ts/function'
import { subscribe, Subscription, SymbolSubscribable } from '@effection/subscription';
import { Channel } from '@effection/channel';
import { Operation } from 'effection';
import { Atom, Sliceable } from './sliceable';
import { assert } from  'assert-ts';

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

  let sliceMaker = <A>(parentOptional: Op.Optional<S, A>) => () => <P extends keyof S>(...path: P[]): Sliceable<S[P]> => {
    assert(Array.isArray(path) && path.length >  0, "slice expects a rest parameter with at least 1 element");

    let getters = [
      parentOptional,
      Op.fromNullable, 
      ...path.map(p => (typeof p === 'number') ? Op.index(p) : Op.prop<S, P>(p))
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sliceOptional = (pipe as any)(...getters) as Op.Optional<S, S[P]>;

    function getter(): S[P] {
      let current = pipe(
        get(),
        sliceOptional.getOption,
        O.toUndefined
      );

      return current as S[P];
    }

    function setter(value: S[P]): void {
      let next = pipe(
        get(),
        sliceOptional.set(value)
      );

      set(next);
    }

    function updater(fn: (s: S[P]) => S[P]) {
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

    function *once(predicate: (state: S[P]) => boolean): Operation<S[P]> {
      let currentState = getter();
      if(predicate(currentState)) {
        return currentState;
      } else {
        let subscription = yield subscribe(slice);
        return yield subscription.filter(predicate).expect();
      }
    }

    function over(fn: (value: S[P]) => S[P]): void {
      update((s) => sliceOptional.set(fn(pipe(sliceOptional.getOption(s), O.toUndefined) as S[P]))(get() as S));
    }

    let slice = {
      get: getter,
      set: setter,
      update: updater,
      remove: remover,
      slice: sliceMaker(sliceOptional),
      once,
      over,
      *[SymbolSubscribable](): Operation<Subscription<S, void>> {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return yield subscribe(atom).map((s) => pipe(sliceOptional.getOption(s), O.toUndefined));
      }
    } as const;

    return slice as unknown as Sliceable<S[P]>;
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

  return atom as unknown as Atom<S>;
}