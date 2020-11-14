import { Operation } from "effection";
import { Channel } from '@effection/channel';
import { subscribe, Subscribable, SymbolSubscribable, Subscription } from '@effection/subscription';
import { Slice } from "./slice";
import { Sliceable } from './sliceable';
import { unique } from './unique';
import * as R from "fp-ts/lib/ReadonlyRecord"

export class Atom<A extends Record<string, unknown>> implements Subscribable<A,undefined> {
  private readonly initial: A;
  private states = new Channel<A>();
  private state: A;


  constructor(initial: A) {
    this.initial = initial;
    this.state = R.fromRecord(initial) as A;
  }

  setMaxListeners(value: number) {
    this.states.setMaxListeners(value);
  }

  get(): A {
    return this.state
  }

  set(value: A) {
    this.state = R.fromRecord(value) as A;
    this.states.send(value);
  }

  update(fn: (state: A) => A) {
    this.set(fn(this.get()));
  }

  *once(predicate: (state: A) => boolean): Operation<A> {
    if(predicate(this.state)) {
      return this.state;
    } else {
      let subscription = yield subscribe(this.states);
      return yield subscription.filter(predicate).expect();
    }
  }

  slice(): Sliceable<A, A> {
    return Slice.fromPath<A, A>(this);
  } 

  reset(initializer?: (initial: A, current: A) => A) {
    if (!initializer) {
      initializer = (initial) => initial;
    }
    
    this.states.close();
    this.state = initializer(this.initial, this.state);
  }

  *[SymbolSubscribable](): Operation<Subscription<A,undefined>> {
    // TODO: we will know this is fixed when we can remove the unique cheque
    return yield subscribe(this.states).filter(unique(this.initial));
  }
}
