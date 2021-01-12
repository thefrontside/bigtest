import { Operation, spawn, fork, resource, Context } from 'effection';
import { EventEmitter } from 'events';

import { compile } from './pattern';
export { any } from './pattern';

import { on } from '@effection/events';
import { subscribe as subscriptionSubscribe, Subscribable } from '@effection/subscription';

export interface SubscriptionMessage {
  event: string;
  args: unknown[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Mailbox<T = any> {
  private subscriptions = new EventEmitter();
  private messages = new Set<T>();

  static *subscribe(
    source: EventEmitter | EventTarget,
    events: string | string[],
  ): Operation<Mailbox<SubscriptionMessage>> {
    let mailbox: Mailbox<SubscriptionMessage> = new Mailbox();

    return yield resource(mailbox, subscribe(mailbox, source, events));
  }

  static *from<R, RReturn = undefined>(
    source: Subscribable<R, RReturn>
  ): Operation<Mailbox<R>> {
    let mailbox: Mailbox<R> = new Mailbox();

    return yield resource(mailbox, function*() {
      yield subscriptionSubscribe(source).forEach(function*(m) { mailbox.send(m) })
    });
  }

  setMaxListeners(value: number): void {
    this.subscriptions.setMaxListeners(value);
  }

  send(message: T): void {
    this.messages.add(message);
    setTimeout(() => this.subscriptions.emit('message', message), 0);
  }

  receive(pattern: unknown = undefined): Operation<T> {
    let match = compile(pattern);

    return ({ resume, ensure }) => {
      let dispatch = (message: T) => {
        if (this.messages.has(message) && match(message)) {
          this.messages.delete(message);
          resume(message);
          return true;
        }
      }

      for (let message of this.messages) {
        if (dispatch(message)) {
          return;
        };
      }

      this.subscriptions.on('message', dispatch);
      ensure(() => this.subscriptions.off('message', dispatch));
    };
  }

  *pipe(other: Mailbox<T>): Operation<Context<void>> {
    let that = this; // eslint-disable-line @typescript-eslint/no-this-alias
    return yield spawn(function*(): Operation<unknown> {
      while(true) {
        let message = yield that.receive();
        other.send(message);
      }
    });
  }

  *map<R>(fn: (from: T) => R): Operation<Mailbox<R>> {
    let that = this; // eslint-disable-line @typescript-eslint/no-this-alias
    let other: Mailbox<R> = new Mailbox();
    return yield resource(other, function*() {
      while(true) {
        let message: T = yield that.receive();
        other.send(fn(message));
      }
    });
  }
}

export function *subscribe(
  mailbox: Mailbox<SubscriptionMessage>,
  source: EventEmitter | EventTarget,
  events: string | string[],
): Operation {
  return yield spawn(function*() {
    for (let name of typeof events === 'string' ? [events] : events) {
      let pipeline = subscriptionSubscribe(on(source, name))
        .map(args => ({ event: name, args }))
        .forEach(function*(value) {
          mailbox.send(value);
        });

      yield fork(pipeline);
    }
  });
}
