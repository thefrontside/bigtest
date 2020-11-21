// import { Operation } from "effection";
// import { Channel } from '@effection/channel';
// import { subscribe, Subscribable, SymbolSubscribable, Subscription } from '@effection/subscription';
// import { Slice } from "./slice";
// import { Sliceable } from './sliceable';
// import { unique } from './unique';
import * as O from "fp-ts/Option";
import { Lens, LensFromPath } from "monocle-ts";
import { Sliceable } from './sliceable';


export class Atom<A> {
  // private readonly initial: A;
  // private states = new Channel<A>();
  private state: O.Option<A>;
  
  constructor(state?: A) {
    this.state = !!state ? O.some(state) : O.none;
  }

  // constructor(initial: A) {
  //   this.initial = initial;
  //   this.state = R.fromRecord(initial) as A;
  // }

  // setMaxListeners(value: number) {
  //   this.states.setMaxListeners(value);
  // }

  get(): A {
    return O.isNone(this.state) ? {} as A : this.state.value as A;
  }

  slice(): Sliceable<A> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (...path: any[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let lens = Lens.fromPath<A>()(path as any) as any;

      return lens.get(this.get());
    }
  } 

  // set(value: A) {
  //   this.state = R.fromRecord(value) as A;
  //   this.states.send(value);
  // }

  // update(fn: (state: A) => A) {
  //   this.set(fn(this.get()));
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
