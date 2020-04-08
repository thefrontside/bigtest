import { Operation, monitor } from 'effection';
import { EventEmitter } from 'events';

import { compile } from './pattern';
export { any } from './pattern';
import { suspend } from './suspend';
import { ensure } from './ensure';

function isEventTarget(target): target is EventTarget { return typeof target.addEventListener === 'function'; }

export interface SubscriptionMessage {
  event: string;
  args: unknown[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Mailbox<T = any> {
  private subscriptions = new EventEmitter();
  private messages = new Set<T>();

  static *subscribe(
    emitter: EventEmitter | EventTarget,
    events: string | string[],
  ): Operation<Mailbox<SubscriptionMessage>> {
    let mailbox: Mailbox<SubscriptionMessage> = new Mailbox();

    yield suspend(monitor(subscribe(mailbox, emitter, events)));

    return mailbox;
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
    yield suspend(monitor(function*() {
      while(true) {
        let message = yield that.receive();
        other.send(message);
      }
    }));
  }

  *map<R>(fn: (from: T) => R): Operation<Mailbox<R>> {
    let that = this; // eslint-disable-line @typescript-eslint/no-this-alias
    let other: Mailbox<R> = new Mailbox();
    yield suspend(monitor(function*() {
      while(true) {
        let message: T = yield that.receive();
        other.send(fn(message));
      }
    }));
    return other;
  }
}

export function *subscribe(
  mailbox: Mailbox<SubscriptionMessage>,
  emitter: EventEmitter | EventTarget,
  events: string | string[],
): Operation {
  for (let name of [].concat(events)) {
    let listener = (...args) => {
      mailbox.send({ event: name, args });
    }

    if(isEventTarget(emitter)) {
      emitter.addEventListener(name, listener);
      yield suspend(ensure(() => emitter.removeEventListener(name, listener)));
    } else {
      emitter.on(name, listener);
      yield suspend(ensure(() => emitter.off(name, listener)));
    }
  }
}
