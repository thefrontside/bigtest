import { Operation } from 'effection';
import { Mailbox } from './effection/mailbox';

export class TestFrame {
  static *start() {
    let frameElement = document.getElementById('test-frame') as HTMLIFrameElement;
    let frameMailbox = yield Mailbox.watch(frameElement, ['load', 'message']);
    return new TestFrame(frameElement, frameMailbox);
  }

  constructor(private element: HTMLIFrameElement, private mailbox: Mailbox) {}

  *load(url): Operation {
    this.element.src = url;
    yield this.mailbox.receive({ event: 'load' });
  }

  send(message) {
    this.element.contentWindow.postMessage(message, '*');
  }

  *receive(): Operation {
    let { args: [message] } = yield this.mailbox.receive({ event: 'message' });
    return message;
  }
}
