import { Operation } from 'effection';
import { once } from '@effection/events';
import { Channel } from '@effection/channel';
import { subscribe } from '@effection/subscription';
import { TestEvent, Run } from '../shared/protocol';
import { setLaneConfigFromAgentFrame } from './lane-config';

export class TestFrame {
  static setup(id: string, src: string): TestFrame {
    let element = document.getElementById(id);
    if (!element) {
      throw new Error(`CRITICAL: unabled to find the test-frame! It should be findable with id: ${id}`);
    }
    if (!(element instanceof HTMLIFrameElement)) {
      throw new Error(`CRITICAL: expected the test frame to be an <iframe>, but it was ${element}`);
    }

    return new TestFrame(element, src);
  }

  constructor(private element: HTMLIFrameElement, private src: string) {}

  *runLane(command: Run, path: string[], report: (event: TestEvent) => void) {
    let { testRunId } = command;
    report({ type: 'lane:begin', testRunId, path });

    try {
      let events = new Channel<TestEvent, undefined>();
      setLaneConfigFromAgentFrame({ command, path, events });

      yield this.clear();

      this.element.src = this.src;

      yield subscribe(events).forEach(function*(event) {
        report(event);
      });

    } finally {
      report({ type: 'lane:end', testRunId, path })
    }
  }

  *clear(): Operation<void> {
    this.element.src = 'about:blank';
    yield once(this.element, 'load');
  }
}
