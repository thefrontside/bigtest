import { describe, it } from 'mocha';
import * as expect from 'expect'

import { Context, fork, monitor } from 'effection';

import { spawn } from './helpers';

import { suspend } from '../src/suspend';
import { Mailbox } from '../src/mailbox';

describe("suspend()", () => {
  let outer: Context;
  let inner: Context;
  let suspended: Context;
  let mailbox: Mailbox;

  beforeEach(() => {
    mailbox = new Mailbox();
    outer = spawn(function*() {
      inner = yield fork(function*() {
        suspended = yield suspend(monitor(function*() {
          yield mailbox.receive("suspended");
          return "from suspended";
        }));
        // does not yield
        return "from inner";
      });
      yield mailbox.receive("outer");
    });
  });

  it('does not block its parent context from exiting', async () => {
    expect(await inner).toEqual("from inner");
  });

  describe('when halting parent', function() {
    beforeEach(() => {
      outer.halt();
    });

    it('also gets halted', async () => {
      await expect(suspended).rejects.toThrow("Interrupted")
    });
  });

  describe('when resumed', function() {
    beforeEach(() => {
      mailbox.send("suspended");
    });

    it('resolves', async () => {
      expect(await suspended).toEqual("from suspended");
    });
  });
});
