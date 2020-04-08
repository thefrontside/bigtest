import { EventEmitter } from 'events';
import { resource, Operation } from 'effection';
import { Mailbox, once } from '@bigtest/effection';
import { Client } from '../../src/client';

/**
 * A helper class for testing subscriptions
 */
export class Subscription<Shape = any> {
  listeners = new EventEmitter();
  frames: Shape[] = [];

  get latest() { return this.frames[this.frames.length - 1]; }

  static *create<Shape>(client: Client, query: string, extract: (result: unknown) => Shape): Operation<Subscription<Shape>> {
    let subscription = new Subscription();
    return yield resource(subscription, client.subscribe(query, function*(response) {
      let frame = extract(response)
      subscription.frames.push(frame);
      subscription.listeners.emit("frame", frame);
    }));
  }

  /**
   * get the _very_ next frame of the subscription. Useful to ensure that sending
   * a message has an immediate effect on the next state, but not useful if an event
   * could trigger multiple state changes
   */
  *next(): Operation<Shape> {
    let [frame]: [Shape] = yield once(this.listeners, "frame");
    return frame;
  }

  *until(predicate: (frame: Shape) => boolean): Operation<Shape> {
    if (this.latest && predicate(this.latest)) {
      return this.latest;
    }

    let mailbox = yield Mailbox.subscribe(this.listeners, "frame");

    while (true) {
      let { args: [frame] } = yield mailbox.receive();
      if (predicate(frame)) {
        return frame;
      }
    }
  }
}
