import { describe, it } from 'mocha';
import * as expect from 'expect'

import { subscribe, ChainableSubscription } from '@effection/subscription';

import { spawn as run } from './helpers';

import { duplexChannel, DuplexChannel } from '../src/index';

describe("duplexChannel", () => {
  let tx: DuplexChannel<string, number>;
  let rx: DuplexChannel<number, string>;

  beforeEach(() => {
    [tx, rx] = duplexChannel<string, number>();
  });

  describe('sending a message to tx', () => {
    let subscription: ChainableSubscription<string, undefined>;

    beforeEach(async () => {
      subscription = await run(subscribe(rx));
      tx.send("hello");
    });

    it('is received on rx', async () => {
      await expect(run(subscription.expect())).resolves.toEqual("hello")
    });
  });

  describe('sending a message to rx', () => {
    let subscription: ChainableSubscription<string, undefined>;

    beforeEach(async () => {
      subscription = await run(subscribe(tx));
      rx.send(123);
    });

    it('is received on rx', async () => {
      await expect(run(subscription.expect())).resolves.toEqual(123)
    });
  });
});
