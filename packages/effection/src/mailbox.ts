import { Operation, spawn, resource } from 'effection';
import { EventEmitter } from 'events';

import { compile } from './pattern';
export { any } from './pattern';
import { ensure } from './ensure';

import { EventSource, addListener, removeListener } from './event-source';

export interface SubscriptionMessage {
  event: string;
  args: unknown[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Mailbox<T = any> {
  private subscriptions = new EventEmitter();
  private messages = new Set<T>();

  static *subscribe(
    source: EventSource,
    events: string | string[],
  ): Operation<Mailbox<SubscriptionMessage>> {
    let mailbox: Mailbox<SubscriptionMessage> = new Mailbox();

    return yield resource(mailbox, subscribe(mailbox, source, events));
  }

  setMaxListeners(value: number) {
    this.subscriptions.setMaxListeners(value);
  }

  send(message: T) {
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

  *pipe(other: Mailbox<T>) {
    let that = this; // eslint-disable-line @typescript-eslint/no-this-alias
    return yield spawn(function*() {
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
  source: EventSource,
  events: string | string[],
): Operation {
  return yield spawn(function*() {
    for (let name of [].concat(events)) {
      let listener = (...args) => {
        mailbox.send({ event: name, args });
      }

      addListener(source, name, listener);
      yield ensure(() => {
        removeListener(source, name, listener)
      });
    }
    yield;
  });
}
