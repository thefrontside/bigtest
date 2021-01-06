import { describe, it } from 'mocha';
import expect from 'expect';

import { subscribe, ChainableSubscription } from '@effection/subscription';

import { spawn as run } from './helpers';

import { createDuplexChannel, DuplexChannel } from '../src/index';

describe("createDuplexChannel", () => {
  let tx: DuplexChannel<string, number>;
  let rx: DuplexChannel<number, string>;

  beforeEach(() => {
    [tx, rx] = createDuplexChannel<string, number>();
  });

  describe('sending a message to tx', () => {
    let subscription: ChainableSubscription<string, undefined>;

    beforeEach(async () => {
      subscription = await run(subscribe(rx));
      tx.send("hello");
    });

    it('is received on rx', async () => {
      await expect(run(subscription.expect())).resolves.toEqual("hello");
    });
  });

  describe('sending a message to rx', () => {
    let subscription: ChainableSubscription<string, undefined>;

    beforeEach(async () => {
      subscription = await run(subscribe(tx));
      rx.send(123);
    });

    it('is received on rx', async () => {
      await expect(run(subscription.expect())).resolves.toEqual(123);
    });
  });
});
