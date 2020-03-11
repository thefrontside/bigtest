import { describe, it } from 'mocha';
import * as expect from 'expect'

import { Context } from 'effection';
import { EventEmitter } from 'events';

import { spawn } from './helpers';

import { Mailbox, SubscriptionMessage, subscribe } from '../src/mailbox';
import { FakeEventEmitter, FakeEvent } from './fake-event-target';

describe("Mailbox", () => {
  describe('listening with no arguments', () => {
    let context: Context;
    let mailbox: Mailbox;
    let message: string;

    beforeEach(() => {
      mailbox = new Mailbox();
      context = spawn(function*() {
        message = yield mailbox.receive();
        return message;
      });
    });

    it('waits for message to be sent', () => {
      expect(message).toEqual(undefined);
    });

    describe('sending a message to a mailbox', () => {
      beforeEach(() => {
        mailbox.send("hello");
      });

      it('receives the message on the other end', async () => {
        expect(await context).toEqual("hello")
      });
    });
  });

  describe('listening with pattern matching', () => {
    let context: Context;
    let mailbox: Mailbox;
    let message: string;

    beforeEach(() => {
      mailbox = new Mailbox();
      context = spawn(function*() {
        message = yield mailbox.receive({ some: "pattern" });
        return message;
      });
    });

    it('waits for message to be sent', () => {
      expect(message).toEqual(undefined);
    });

    describe('sending a message which does not match the pattern', () => {
      beforeEach(() => {
        mailbox.send({ does: "not match" });
      });

      it('does not cause message to be received', async () => {
        expect(message).toEqual(undefined)
      });

      describe('receiving the non matching message', () => {
        let otherContext: Context;

        beforeEach(() => {
          otherContext = spawn(mailbox.receive());
        });

        it('caches it', async () => {
          expect(await otherContext).toEqual({ does: "not match" });
        });
      });
    });

    describe('sending a message which matches the pattern', () => {
      beforeEach(() => {
        mailbox.send({ some: "pattern" });
      });

      it('receives the message', async () => {
        expect(await context).toEqual({ some: "pattern" });
      });
    });
  });

  describe('listening from multiple sources', () => {
    let mailbox: Mailbox;
    let context1: Context;
    let context2: Context;
    let message1: string;
    let message2: string;

    beforeEach(() => {
      mailbox = new Mailbox();
      context1 = spawn(function*() {
        message1 = yield mailbox.receive();
        return message1;
      });
      context2 = spawn(function*() {
        message2 = yield mailbox.receive();
        return message2;
      });
      mailbox.send("hello");
    });

    it('receives the message only once', async () => {
      let result = await Promise.race([context1, context2]);
      expect(result).toEqual("hello")
      // one of message and otherMessage should be received, but not both
      expect(message1 && message2).toBeFalsy();
      expect(message1 || message2).toBeTruthy();
    });
  });

  describe('subscribe to an EventEmitter', () => {
    let emitter: EventEmitter;
    let mailbox: Mailbox<SubscriptionMessage>;

    beforeEach(() => {
      emitter = new EventEmitter();
      mailbox = new Mailbox();
      spawn(subscribe(mailbox, emitter, "thing"));
    });

    describe('emitting an event', () => {
      beforeEach(() => {
        emitter.emit("thing", 123, true);
      });

      it('receives event as message', async () => {
        let { event, args } = await spawn(mailbox.receive());
        expect(event).toEqual("thing");
        expect(args).toEqual([123, true]);
      });
    });
  });

  describe('subscribing to an EventTarget', () => {
    let target: FakeEventEmitter;
    let mailbox: Mailbox<SubscriptionMessage>;
    let thingEvent: FakeEvent;

    beforeEach(() => {
      target = new FakeEventEmitter();
      mailbox = new Mailbox();
      spawn(subscribe(mailbox, target, "thing"));
    });

    describe('emitting an event', () => {
      beforeEach(() => {
        thingEvent = new FakeEvent("thing");
        target.dispatchEvent(thingEvent);
      });

      it('receives event as message', async () => {
        let { event, args } = await spawn(mailbox.receive());
        expect(event).toEqual("thing");
        expect(args).toEqual([thingEvent]);
      });
    });
  });

  describe('piping a mailbox into another mailbox', () => {
    let source: Mailbox;
    let destination: Mailbox;

    beforeEach(() => {
      source = new Mailbox();
      destination = new Mailbox();
      spawn(function*() {
        yield source.pipe(destination);
        yield;
      });
    });

    describe('forwards messages from the source mailbox to the destination', () => {
      let message;

      beforeEach(async () => {
        source.send("hello");
        message = await spawn(destination.receive());
      });

      it('receives message on destination', async () => {
        expect(message).toEqual("hello");
      });
    });
  });

  describe('mapping over a mailbox', () => {
    let source: Mailbox;
    let destination: Mailbox;

    beforeEach(() => {
      source = new Mailbox();
      spawn(function*() {
        destination = yield source.map((message) => message.toUpperCase());
        yield;
      });
    });

    describe('applies mapping function to source mailbox', () => {
      let message;

      beforeEach(async () => {
        source.send("hello");
        message = await spawn(destination.receive());
      });

      it('receives message on destination', async () => {
        expect(message).toEqual("HELLO");
      });
    });
  });
});
