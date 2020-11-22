// import { Operation } from "effection";
// import { Channel } from '@effection/channel';
// import { subscribe, Subscribable, SymbolSubscribable, Subscription } from '@effection/subscription';
// import { Slice } from "./slice";
// import { Sliceable } from './sliceable';
// import { unique } from './unique';
import * as O from "fp-ts/Option";
import { Lens } from "monocle-ts";
import { Sliceable } from './sliceable';
import { assert } from 'assert-ts';
import { constant, identity } from 'fp-ts/lib/function';
import { pipe } from 'fp-ts/function'

const LensId = new Lens(identity, constant);

export class Atom<S> {
  // private readonly initial: A;
  // private states = new Channel<A>();
  private state: O.Option<S>;
  private lens: Lens<S, S>;
  
  constructor(state?: S, lens?: Lens<S, S>) {
    this.state = O.fromNullable(state);

    this.lens = (lens ?? LensId as Lens<S,S>);
  }

  // constructor(initial: A) {
  //   this.initial = initial;
  //   this.state = R.fromRecord(initial) as A;
  // }

  // setMaxListeners(value: number) {
  //   this.states.setMaxListeners(value);
  // }`

  get(): S | undefined {
    return pipe(
      this.state,
      O.map(state => this.lens.get(state)),
      O.toUndefined
    );
  }
  
  slice(): Sliceable<S> {
    return <P extends keyof S>(...path: P[]) => {
      assert(Array.isArray(path) && path.length >  0, "slice expects a rest parameter with at least 1 element");
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let lens = Lens.fromPath<S>()(path as any) as any;

      let state = pipe(this.state, O.toUndefined);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new Atom(state as any, this.lens.compose(lens));
    }
  } 

  // update(fn: (state: S) => S) {
    
  // }

  // *once(predicate: (state: A) => boolean): Operation<A> {
  //   if(predicate(this.state)) {
  //     return this.state;
  //   } else {
  //     let subscription = yield subscribe(this.states);
  //     return yield subscription.filter(predicate).expect();
  //   }
  // }

  // slice(): Sliceable<A, A> {
  //   return Slice.fromPath<A, A>(this);
  // } 

  // reset(initializer?: (initial: A, current: A) => A) {
  //   if (!initializer) {
  //     initializer = (initial) => initial;
  //   }
    
  //   this.states.close();
  //   this.state = initializer(this.initial, this.state);
  // }

  // *[SymbolSubscribable](): Operation<Subscription<A,undefined>> {
  //   // TODO: we will know this is fixed when we can remove the unique cheque
  //   return yield subscribe(this.states).filter(unique(this.initial));
  // }
}
