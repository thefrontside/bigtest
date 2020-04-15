import { Operation, resource } from 'effection';
import { Mailbox, subscribe } from '@bigtest/effection';

export class TestFrame {
  static *start(): Operation<TestFrame> {
    let element = document.getElementById('test-frame') as HTMLIFrameElement;

    let mailbox = new Mailbox();
    let frame = new TestFrame(element, mailbox);
    return yield resource(frame, subscribe(mailbox, window, 'message'));
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
