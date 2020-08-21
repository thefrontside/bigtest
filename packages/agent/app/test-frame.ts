import { Operation } from 'effection';
import { bigtestGlobals } from '@bigtest/globals';
import { once } from '@effection/events';

export class TestFrame {
  static *start(): Operation<TestFrame> {
    let element = document.getElementById('test-frame') as HTMLIFrameElement;

    bigtestGlobals.testFrame = element;

    return new TestFrame(element);
  }

  constructor(private element: HTMLIFrameElement) {}

  *load(url: string) {
    this.element.src = url;
    yield once(this.element, 'load');
  }

  send(message: unknown) {
    if (this.element.contentWindow) {
      this.element.contentWindow.postMessage(message, '*');
    }
  }

  clear(): Operation<void> {
    return this.load('about:blank');
  }
}
