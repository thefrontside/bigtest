import { Operation } from 'effection';
import { Mailbox, suspend } from '@bigtest/effection';

export class TestFrame {
  static *start() {
    let element = document.getElementById('test-frame') as HTMLIFrameElement;

    let mailbox = new Mailbox();
    yield suspend(mailbox.subscribe(window, ['message']));
    return new TestFrame(element, mailbox);
  }

  constructor(private element: HTMLIFrameElement, private mailbox: Mailbox) {}

  load(url): Operation {
    return ({ resume, ensure }) => {
      this.element.src = url;
      this.element.addEventListener('load', resume);
      ensure(() => this.element.removeEventListener('load', resume));
    }
  }

  send(message) {
    this.element.contentWindow.postMessage(message, '*');
  }

  *receive(): Operation {
    let { args: [message] } = yield this.mailbox.receive();
    return JSON.parse(message.data);
  }
}
