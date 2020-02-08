import { fork, monitor, Operation } from 'effection';
import { EventEmitter } from 'events';

import { on, onEach, EventName } from '../events';
import { compile } from './pattern';
export { any } from './pattern';

export class Mailbox {
  private subscriptions = new EventEmitter();
  private messages = new Set();

  *send(message: unknown): Operation {
    this.messages.add(message);
    this.subscriptions.emit('message');
  }

  *receive(pattern: unknown = undefined): Operation {
    let match = compile(pattern);
    let { messages, subscriptions } = this;
    while (true) {
      for (let message of messages) {
        if (match(message)) {
          messages.delete(message);
          return message;
        }
      }
      yield on(subscriptions, 'message');
    }
  }

  static *watch(
    emitter: EventEmitter,
    events: EventName | EventName[],
    prepare: (event: { event: string; args: unknown[] }) => unknown = x => x
  ): Operation {
    let mailbox = new Mailbox();
    let parent = yield ({ resume, context: { parent }}) => resume(parent.parent);

    parent.spawn(monitor(function* () {
      for (let name of [].concat(events)) {
        yield fork(onEach(emitter, name, (...args) => mailbox.send(prepare({ event: name, args }))));
      }
    }));
    return mailbox;
  }
}
