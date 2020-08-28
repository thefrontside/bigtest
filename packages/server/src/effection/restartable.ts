import { spawn, Context, Operation } from 'effection'
import { subscribe, ChainableSubscription } from '@effection/subscription';
import { Slice } from "@bigtest/atom";

export function *restartable<T>(slice: Slice<T, unknown>, operation: (t: T) => Operation<void>): Operation<void> {
  let current: Context | null = null;

  let subscription: ChainableSubscription<T, undefined> = yield subscribe(slice);

  for(let currentValue = slice.get();;currentValue = slice.get()) {
    if (current) {
      current.halt();
    }

    current = yield spawn(operation(currentValue));

    while(true) {
      let next = yield subscription
        .filter(value => currentValue !== value)
        .first();

      if (next) {
        break;
      }

      // Calling .reset on the atom closes the channels, which breaks subscriptions
      // We want the app service to stay alive, so we'll re-subscribe
      subscription = yield subscribe(slice);
    }
  }
}