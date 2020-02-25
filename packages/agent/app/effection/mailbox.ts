import { monitor, Operation } from 'effection';
import { EventEmitter } from 'events';

import { compile } from './pattern';
export { any } from './pattern';

export class Mailbox {
  private subscriptions = new EventEmitter();
  private messages = new Set();

  send(message: unknown) {
    this.messages.add(message);
    this.subscriptions.emit('message', message);
  }

  receive(pattern: unknown = undefined): Operation {
    let match = compile(pattern);

    return ({ resume, ensure }) => {
      let dispatch = (message: unknown) => {
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

  static *watch(
    emitter: EventTarget,
    events: string | string[],
    prepare: (event: { event: string; args: unknown[] }) => unknown = x => x
  ): Operation {
    let mailbox = new Mailbox();
    let parent = yield ({ resume, context: { parent }}) => resume(parent.parent);

    parent.spawn(monitor(({ ensure }) => {
      for (let name of [].concat(events)) {
        let listener = (...args) => {
          mailbox.send(prepare({ event: name, args }));
        }

        emitter.addEventListener(name, listener);
        ensure(() => emitter.removeEventListener(name, listener));
      }
    }));
    return mailbox;
  }
}
