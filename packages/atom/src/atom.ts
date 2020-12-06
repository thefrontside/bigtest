import * as O from "fp-ts/Option";
import * as Op from "monocle-ts/lib/Optional"
import { pipe } from 'fp-ts/function'
import { subscribe, Subscription, SymbolSubscribable } from '@effection/subscription';
import { Channel } from '@effection/channel';
import { Operation } from 'effection';
import { Atom } from './sliceable';

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
    ) as S;

    set(next);
  }

  // function *once(predicate: (state: S) => boolean): Operation<S> {
  //   if(predicate(state as S)) {
  //     return state as S;
  //   } else {
  //     let subscription = yield subscribe(states);
  //     return yield subscription.filter(predicate).expect();
  //   }
  // }

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

  // let sliceMaker = <A>(parentLens: Lens<S, A>) => (): Sliceable<S> => <P extends keyof S>(...path: P[]) => {
  //   assert(Array.isArray(path) && path.length >  0, "slice expects a rest parameter with at least 1 element");
    
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   let sliceLens = parentLens.compose(Lens.fromPath<S>()(path as any) as any);

  //   let slice = {
  //     get(): A | undefined {
  //       return pipe(
  //         get(),
  //         O.fromNullable,
  //         O.map(s => sliceLens.get(s)),
  //         O.toUndefined
  //       ) as A;
  //     },
  //     set(value: A): void {
  //       let next = pipe(
  //         get(),
  //         O.fromNullable,
  //         O.map(s => sliceLens.asOptional().set(value)(s as S)),
  //         O.toUndefined
  //       );

  //       set(next as S);
  //     },
  //     update(fn: (s: A) => S) {
  //       let next = pipe(
  //         get(),
  //         O.fromNullable,
  //         O.map(s => {
  //           let updated = fn(sliceLens.get(get() as S) as A);
            
  //           return sliceLens.asOptional().modify(() => updated)(s as S);
  //         }),
  //         O.toUndefined
  //       );

  //       update(() => next as S);
  //     },
  //     remove() {
  //       let next = pipe(
  //         get(),
  //         O.fromNullable,
  //         O.map(s => sliceLens.asOptional().modify(() => undefined)(s as S)),
  //         O.toUndefined
  //       );

  //       update(() => next as S);
  //     },
  //     over(fn: (value: S) => S): void {
  //       update((s) => sliceLens.set(fn(sliceLens.get(s) as S))(get() as S));
  //     },
  //     slice: sliceMaker(sliceLens as Lens<S, S>),
  //     *[SymbolSubscribable](): Operation<Subscription<S, void>> {
  //       // eslint-disable-next-line @typescript-eslint/no-use-before-define
  //       return yield subscribe(atom).map((s) => sliceLens.get(s));
  //     }
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   } as any;

  //   slice.once = function *(predicate: (state: S) => boolean): Operation<S> {
  //     let currentState = sliceLens.get(get() as S);
  //     if(predicate(currentState as S)) {
  //       return currentState as S;
  //     } else {
  //       let subscription = yield subscribe(slice);
  //       return yield subscription.filter(predicate).expect();
  //     }
  //   }

  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   return slice;
  // }

  let atom = ({
    get,
    set,
    update,
    // slice: sliceMaker(lens),
    // once,
    reset,
    setMaxListeners,
    *[SymbolSubscribable](): Operation<Subscription<S,undefined>> {
      return yield subscribe(states);
    }
  } as const);

  return atom;
}