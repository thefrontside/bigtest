import * as O from "fp-ts/Option";
import * as Op from "monocle-ts/lib/Optional"
import { pipe } from 'fp-ts/function'
import { subscribe, Subscription, SymbolSubscribable } from '@effection/subscription';
import { Channel } from '@effection/channel';
import { Operation } from 'effection';
import { Atom, Sliceable, AtomConfig } from './sliceable';
import { assert } from  'assert-ts';
import { unique } from './unique';

export const DefaultChannelMaxListeners = 100000;

export function createAtom<S>(init: S, { channelMaxListeners = DefaultChannelMaxListeners }: AtomConfig = {}): Atom<S> {
  let initialState = init;
  let lens = pipe(Op.id<O.Option<S>>(), Op.some);
  let state: O.Option<S> = O.fromNullable(init);
  let states = new Channel<S>();

  states.setMaxListeners(channelMaxListeners);

  function getOption(): O.Option<S> {
    return pipe(
      state,
      lens.getOption
    );
  }

  function get(): S {
    return pipe(
      getOption(),
      O.toUndefined
    ) as S;
  }

  function set(value: S): void {
    if(value === get()) {
      return;
    }

    state = pipe(
      getOption(),
      lens.getOption,
      lens.set(value as S),
    );

    states.send(O.toUndefined(state) as S);
  }

  function update(fn: (s: S) => S) {
    let next = pipe(
      lens,
      Op.modify(fn),
    )(getOption());

    set(O.toUndefined(next) as S);
  }

  function *once(predicate: (state: S) => boolean): Operation<S> {
    let current = get();
    if(predicate(current)) {
      return current as S;
    } else {
      let subscription = yield subscribe(states);
      return yield subscription.filter(predicate).expect();
    }
  }

  function reset(initializer?: (initial: S, curr: S) => S) {
    if (!initializer) {
      initializer = (initial) => {
        return initial;
      }
    }
    states.close();
    set(initializer(initialState, get()));
  }

  let sliceMaker = <A>(parentOptional: Op.Optional<O.Option<S>, A>) => <P extends keyof S>(...path: P[]): Sliceable<S[P]> => {
    assert(Array.isArray(path) && path.length >  0, "slice expects a rest parameter with at least 1 element");

    let getters = [
      parentOptional,
      Op.fromNullable, 
      ...path.map(p => (typeof p === 'number') ? Op.index(p) : Op.prop<S, P>(p))
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sliceOptional = (pipe as any)(...getters) as Op.Optional<O.Option<S>, S[P]>;

    function getSliceOption(): O.Option<S[P]> {
      let current = pipe(
        getOption(),
        sliceOptional.getOption,
      );

      return current;
    }

    function getSlice(): S[P] {
      return pipe(
        getSliceOption(),
        O.toUndefined
      ) as S[P];
    }

    function setSlice(value: S[P]): void {
      if(value === getSlice()) {
        return;
      }

      let next = pipe(
        getOption(),
        sliceOptional.set(value),
        O.toUndefined
      );

      set(next as S);
    }

    function updateSlice(fn: (s: S[P]) => S[P]) {
      let next = pipe(
        sliceOptional,
        Op.modify(fn),
      )(getOption());
    
      set(O.toUndefined(next) as S);
    }

    function removeSlice() {
      let next = pipe(
        sliceOptional,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Op.modify(() => undefined as any),
      )(getOption());

      set(O.toUndefined(next) as S);
    }

    function *onceSlice(predicate: (state: S[P]) => boolean): Operation<S[P]> {
      let currentState = getSlice();
      if(predicate(currentState)) {
        return currentState;
      } else {
        let subscription = yield subscribe(slice);
        return yield subscription.filter(predicate).expect();
      }
    }

    function over(fn: (value: S[P]) => S[P]): void {
      update((s) => {
        let next = pipe(
          getOption(),
          sliceOptional.set(
          pipe(
            s,
            O.fromNullable,
            sliceOptional.getOption,
            O.toUndefined as ((a: O.Option<S[P]>) => S[P]),
            fn,
          )
        ),
        O.toUndefined);

        return next as S;
      });
    }

    let slice = {
      get: getSlice,
      set: setSlice,
      update: updateSlice,
      remove: removeSlice,
      slice: sliceMaker(sliceOptional),
      once: onceSlice,
      over,
      *[SymbolSubscribable](): Operation<Subscription<S, void>> {
        return yield subscribe(atom).map(
          (s) => pipe(s, O.fromNullable, sliceOptional.getOption, O.toUndefined) as S[P]
        ).filter(unique(getSlice()));
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _channelMaxListeners: (states as any).bus._maxListeners,
    *[SymbolSubscribable](): Operation<Subscription<S,undefined>> {
      return yield subscribe(states);
    }
  } as const);

  return atom as unknown as Atom<S>;
}