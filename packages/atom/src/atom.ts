import { Operation } from "effection";
import { Channel } from '@effection/channel';
import { subscribe, Subscribable, SymbolSubscribable, Subscription } from '@effection/subscription';
import { Slice } from "./slice";
import { Sliceable } from './sliceable';
import { unique } from './unique';

export class Atom<A> implements Subscribable<A,undefined> {
  private readonly initial: A;
  private state: A;
  private states = new Channel<A>();


  constructor(initial: A) {
    this.initial = this.state = initial;
  }

  setMaxListeners(value: number) {
    this.states.setMaxListeners(value);
  }

  get(): A {
    return this.state;
  }

  set(value: A) {
    this.state = value;
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
