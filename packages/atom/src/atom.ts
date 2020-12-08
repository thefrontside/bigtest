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
  let lens = pipe(Op.id<O.Option<S>>(), Op.some);
  let state: O.Option<S> = O.fromNullable(init);
  let states = new Channel<S | undefined>();

  function getOption(): O.Option<S> {
    return pipe(
      state,
      lens.getOption
    );
  }

  function get(): S | undefined {
    return pipe(
      getOption(),
      O.toUndefined
    );
  }

  function set(value: S | undefined): void {
    let current = getOption();

    if(value === O.toUndefined(current)) {
      return;
    }

    state = pipe(
      current,
      lens.getOption,
      lens.set(value as S),
    );

    states.send(O.toUndefined(state));
  }

  function update(fn: (s: S | undefined) => S | undefined) {
    let next = pipe(
      getOption(),
      O.toUndefined,
      fn,
    );

    set(next);
  }

  function *once(predicate: (state: S | undefined) => boolean): Operation<S> {
    let current = O.toUndefined(getOption());
    if(predicate(current)) {
      return current as S;
    } else {
      let subscription = yield subscribe(states);
      return yield subscription.filter(predicate).expect();
    }
  }

  function reset(initializer?: (initial: S | undefined, curr: S | undefined) => S | undefined) {
    if (!initializer) {
      initializer = (initial) => initial;
    }
    states.close();
    set(initializer(initialState, O.toUndefined(getOption())));
  }

  function setMaxListeners(value: number) {
    states.setMaxListeners(value);
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

    function getter(): S[P] | undefined {
      return pipe(
        getSliceOption(),
        O.toUndefined
      )
    }

    function setter(value: S[P]): void {
      let next = pipe(
        getOption(),
        sliceOptional.set(value),
        O.toUndefined
      );

      set(next);
    }

    function updater(fn: (s: S[P]) => S[P]) {
      let next = pipe(
        sliceOptional,
        Op.modify(fn),
      )(getOption());
    
      set(O.toUndefined(next));
    }

    function remover() {
      let next = pipe(
        sliceOptional,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Op.modify(() => undefined as any),
      )(getOption());

      set(O.toUndefined(next));
    }

    function *once(predicate: (state: S[P]) => boolean): Operation<S[P]> {
      let currentState = getter() as S[P];
      if(predicate(currentState)) {
        return currentState;
      } else {
        let subscription = yield subscribe(slice);
        return yield subscription.filter(predicate).expect();
      }
    }

    function over(fn: (value: S[P] | undefined) => S[P]): void {
      update((s) => {
        let next = sliceOptional.set(
          pipe(
            s,
            O.fromNullable,
            sliceOptional.getOption,
            O.toUndefined,
            fn,
          )
        )(getOption());

        return O.toUndefined(next);
      });
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
        return yield subscribe(atom).map((s) => pipe(s, O.fromNullable, sliceOptional.getOption, O.toUndefined));
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