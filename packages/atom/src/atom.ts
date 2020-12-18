import * as O from "fp-ts/Option";
import * as Op from "monocle-ts/lib/Optional"
import { pipe } from 'fp-ts/function'
// import { subscribe, Subscription, SymbolSubscribable } from '@effection/subscription';
import { Channel } from '@effection/channel';
// import { Operation } from 'effection';
import { Atom, Sliceable, AtomConfig, Slice } from './sliceable';
import { assert } from  'assert-ts';
// import { unique } from './unique';

export const DefaultChannelMaxListeners = 100000;

export function createAtom<S>(init: S, { channelMaxListeners = DefaultChannelMaxListeners }: AtomConfig = {}): Atom<S> {
  // let initialState = init;
  let lens = pipe(Op.id<O.Option<S>>(), Op.some);
  let state: O.Option<S> = O.fromNullable(init);
  let states = new Channel<S>();

  states.setMaxListeners(channelMaxListeners);

  // function getOption(): O.Option<S> {
  //   return pipe(
  //     state,
  //     lens.getOption
  //   );
  // }

  // function get(): S {
  //   return pipe(
  //     getOption(),
  //     O.toUndefined
  //   ) as S;
  // }

  // function set(value: S): void {
  //   if(value === get()) {
  //     return;
  //   }

  //   state = pipe(
  //     getOption(),
  //     lens.getOption,
  //     lens.set(value as S),
  //   );

  //   states.send(O.toUndefined(state) as S);
  // }

  // function update(fn: (s: S) => S) {
  //   let next = pipe(
  //     lens,
  //     Op.modify(fn),
  //   )(getOption());

  //   set(O.toUndefined(next) as S);
  // }

  // function *once(predicate: (state: S) => boolean): Operation<S> {
  //   let current = get();
  //   if(predicate(current)) {
  //     return current as S;
  //   } else {
  //     let subscription = yield subscribe(states);
  //     return yield subscription.filter(predicate).expect();
  //   }
  // }

  // function reset(initializer?: (initial: S, curr: S) => S) {
  //   if (!initializer) {
  //     initializer = (initial) => {
  //       return initial;
  //     }
  //   }
  //   states.close();
  //   set(initializer(initialState, get()));
  // }

  function getState(): O.Option<S> {
    return state;
  }

  function setState(value: S) {
   let next = O.fromNullable(value);
   
   if (next === getState()) {
    return;
   }

   state =  next;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sliceMaker = <A>(parentOptional: Op.Optional<O.Option<S>, A>): Sliceable<any> => <P extends keyof A>(...path: P[]): Slice<A[P]> => {
    assert(Array.isArray(path) && path.length >  0, "slice expects a rest parameter with at least 1 element");

    let isRoot = parentOptional === lens as unknown as Op.Optional<O.Option<S>, A>;

    let getters = [
      parentOptional,
      Op.fromNullable, 
      ...path.map(p => (typeof p === 'number') ? Op.index(p) : Op.prop<A, P>(p))
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sliceOptional = (isRoot ? lens : (pipe as any)(...getters)) as Op.Optional<O.Option<S>, A[P]>;

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
      let current = get();
      
      if(value === get()) {
        return;
      }

      let next = pipe(
        getState(),
        sliceOptional.set(value),
        O.toUndefined
      );

      if(next as unknown as A[P] === current) {
        return;
      }

      setState(next as S);
    }

    function update(fn: (s: A[P]) => A[P]) {
      let next = pipe(
        sliceOptional,
        Op.modify(fn),
      )(getState());
    
      setState(O.toUndefined(next) as S);
    }

    // function removeSlice() {
    //   let next = pipe(
    //     sliceOptional,
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     Op.modify(() => undefined as any),
    //   )(getOption());

    //   set(O.toUndefined(next) as S);
    // }

    // function *onceSlice(predicate: (state: A[P]) => boolean): Operation<A[P]> {
    //   let currentState = get();
    //   if(predicate(currentState)) {
    //     return currentState;
    //   } else {
    //     let subscription = yield subscribe(slice);
    //     return yield subscription.filter(predicate).expect();
    //   }
    // }

    // function over(fn: (value: A[P]) => A[P]): void {
    //   update((s) => {
    //     let next = pipe(
    //       getOption(),
    //       sliceOptional.set(
    //       pipe(
    //         s,
    //         O.fromNullable,
    //         sliceOptional.getOption,
    //         O.toUndefined as ((a: O.Option<A[P]>) => A[P]),
    //         fn,
    //       )
    //     ),
    //     O.toUndefined);

    //     return next as S;
    //   });
    // }

    // let slice = {
    //   get: get,
    //   set: set,
    //   update: updateSlice,
    //   remove: removeSlice,
    //   slice: sliceMaker(sliceOptional),
    //   once: onceSlice,
    //   over,
    //   *[SymbolSubscribable](): Operation<Subscription<S, void>> {
    //     return yield subscribe(atom).map(
    //       (s) => pipe(s, O.fromNullable, sliceOptional.getOption, O.toUndefined) as A[P]
    //     ).filter(unique(get()));
    //   },
    //   _reset: reset,
    // } as const;

    let slice: Slice<A[P]> = {
      get,
      set,
      update
    }
    
    return slice;
  }
  
  // let atom = ({
  //   get,
  //   set,
  //   update,
  //   slice: sliceMaker(lens),
  //   once,
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   _channelMaxListeners: (states as any).bus._maxListeners,
  //   *[SymbolSubscribable](): Operation<Subscription<S,undefined>> {
  //     return yield subscribe(states);
  //   },
  //   // _reset: reset
  // } as const);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let atom: Atom<S>  = sliceMaker(lens)('') as unknown as Atom<S>;
  
  return atom;
}

// This is purely for testing purposes
export function resetAtom<S>(atom: Atom<S>, initializer?: (initial: S, curr: S) => S | undefined) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (atom as any)._reset(initializer)
}