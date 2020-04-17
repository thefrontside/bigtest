import { describe, it } from 'mocha';
import * as expect from 'expect'

import { Context, resource } from 'effection';

import { spawn } from './helpers';

import { ensure } from '../src/ensure';
import { Mailbox } from '../src/mailbox';

describe("ensure()", () => {
  let context: Context;
  let didRun: boolean;

  beforeEach(() => didRun = false);

  describe('with blocking context', () => {
    beforeEach(async () => {
      context = spawn(function*() {
        yield ensure(() => didRun = true);
        yield
      });
    });

    it('does not run', () => {
      expect(didRun).toEqual(false);
    });

    describe('when halted', () => {
      beforeEach(async () => {
        context.halt();
      });

      it('runs', () => {
        expect(didRun).toEqual(true);
      });
    });
  });

  describe('with successful context', () => {
    let result;

    beforeEach(async () => {
      result = await spawn(function*() {
        yield ensure(() => didRun = true);
        return 123;
      });
    });

    it('runs', async () => {
      expect(result).toEqual(123)
      expect(didRun).toEqual(true)
    });
  });

  describe('with failed context', () => {
    let error;

    beforeEach(async () => {
      try {
        await spawn(function*() {
          yield ensure(() => didRun = true);
          throw new Error("moo");
        });
      } catch(e) {
        error = e;
      }
    });

    it('runs', async () => {
      expect(error.message).toEqual("moo")
      expect(didRun).toEqual(true)
    });
  });

  describe("when used with resource", () => {
    let outer: Context;
    let inner: Context;
    let mailbox: Mailbox;

    beforeEach(() => {
      mailbox = new Mailbox();
      outer = spawn(function*() {
        inner = yield function*() {
          let obj = { from: "inner" };
          let res = yield resource(obj, ensure(() => didRun = true));


          return res;
        };
        return yield mailbox.receive();
      });
    });

    it('does not block its parent context from exiting', async () => {
      expect(await inner).toEqual({ from: "inner" });
    });

    it('does not run when parent context exits', async () => {
      expect(didRun).toEqual(false);
    });

    describe('when halting parent', function() {
      beforeEach(() => {
        outer.halt();
      });

      it('runs', async () => {
        expect(didRun).toEqual(true);
      });
    });

    describe('when parent exits successfully', function() {
      beforeEach(async () => {
        mailbox.send("resume");
        await outer;
      });

      it('runs', async () => {
        expect(didRun).toEqual(true);
      });
    });
  });
});
