import { Operation } from 'effection';
import { Mailbox } from './effection/mailbox';
import { suspend } from './effection/suspend';

export class ParentFrame {
  static *start() {
    let mailbox = new Mailbox();
    yield suspend(mailbox.watch(window, ['message']));
    return new ParentFrame(mailbox);
  }

  constructor(private mailbox: Mailbox) {}

  send(message) {
    window.parent.postMessage(JSON.stringify(message), "*");
  }

  *receive(): Operation {
    let { args: [message] } = yield this.mailbox.receive({ event: 'message' });
    return message.data;
  }
}
