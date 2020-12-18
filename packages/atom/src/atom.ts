import * as O from "fp-ts/Option";
import * as Op from "monocle-ts/lib/Optional"
import { pipe } from 'fp-ts/function'
import { Channel } from '@effection/channel';
import { MakeSlice, AtomConfig, Slice } from './types';
import { Operation } from 'effection';
import { subscribe, Subscription, SymbolSubscribable } from '@effection/subscription';
import { unique } from './unique';

export const DefaultChannelMaxListeners = 100000;

export function createAtom<S>(init: S, { channelMaxListeners = DefaultChannelMaxListeners }: AtomConfig = {}): Slice<S> {
  let initialState = init;
  let lens = pipe(Op.id<O.Option<S>>(), Op.some);
  let state: O.Option<S> = O.fromNullable(init);
  let states = new Channel<S>();

  states.setMaxListeners(channelMaxListeners);

  function getState(): O.Option<S> {
    return state;
  }

  function setState(value: S) {
    let next = O.fromNullable(value);

    if (next === getState()) {
    return;
    }

    state = next;

    states.send(O.toUndefined(state) as S);
  }

  function reset(initializer?: (initial: S, curr: S) => S) {
    if (!initializer) {
      initializer = (initial) => {
        return initial;
      }
    }
    
    states.close();

    setState(initializer(initialState, O.toUndefined(getState()) as S));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sliceMaker = <A>(parentOptional: Op.Optional<O.Option<S>, A> = lens as unknown as Op.Optional<O.Option<S>, A>): MakeSlice<any> =>
    <P extends keyof A>(...path: P[]): Slice<A[P]> => {
      let getters = [
        parentOptional,
        Op.fromNullable,
        ...(path || []).map(p => (typeof p === 'number') ? Op.index(p) : Op.prop<A, P>(p))
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let sliceOptional = (pipe as any)(...getters) as unknown as Op.Optional<O.Option<S>, A[P]>;

      function getOption(): O.Option<A[P]> {
        let current = pipe(
          getState(),
          sliceOptional.getOption,
        );

        return current;
      }

      function get(): A[P] {
        return pipe(
          getOption(),
          O.toUndefined
        ) as A[P];
      }

      function set(value: A[P]): void {
        if(value === get()) {
          return;
        }

        let next = pipe(
          getState(),
          sliceOptional.set(value),
          O.toUndefined
        );

        setState(next as S);
      }

      function update(fn: (s: A[P]) => A[P]) {
        let next = pipe(
          sliceOptional,
          Op.modify(fn),
        )(getState());
      
        setState(O.toUndefined(next) as S);
      }

      function remove() {
        let next = pipe(
          sliceOptional,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Op.modify(() => undefined as any),
        )(getState());

        setState(O.toUndefined(next) as S);
      }

      function *once(predicate: (state: A[P]) => boolean): Operation<A[P]> {
        let currentState = get();
        if(predicate(currentState)) {
          return currentState;
        } else {
          let subscription = yield subscribe(slice);
          return yield subscription.filter(predicate).expect();
        }
      }

      let slice: Slice<A[P]> = {
        get,
        set,
        update,
        once,
        slice: sliceMaker(sliceOptional),
        remove,
        *[SymbolSubscribable](): Operation<Subscription<A[P], undefined>> {
          return yield subscribe(states).map(
            (s) => pipe(s, O.fromNullable, sliceOptional.getOption, O.toUndefined) as A[P]
          ).filter(unique(get()));
        },
      }
      
      return slice;
  }

  return {
    ...sliceMaker()(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _channelMaxListeners: (states as any).bus._maxListeners,
    _reset: reset
  };
}

// This is purely for testing purposes
export function resetAtom<S>(atom: Slice<S>, initializer?: (initial: S, curr: S) => S | undefined) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (atom as any)._reset(initializer)
}