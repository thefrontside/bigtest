import { Operation, resource } from 'effection';
import { Mailbox, subscribe } from '@bigtest/effection';

export class ParentFrame {
  static *start(): Operation<ParentFrame> {
    let mailbox = new Mailbox();
    let frame = new ParentFrame(mailbox);
    return yield resource(frame, subscribe(mailbox, window, ['message']));
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
