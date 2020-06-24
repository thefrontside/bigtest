import { Operation, spawn } from 'effection';
import { Mailbox } from '@bigtest/effection';

import Parcel, { createWorkerFarm } from '@parcel/core';

type ParcelOptions = { [key: string]: unknown };
type ParcelAsyncSubscription = { unsubscribe(): Promise<void> };

interface ParcelServerOptions {
  port?: number;
};

export function* createParcelServer(entryPoints: string[], options: ParcelServerOptions & ParcelOptions): Operation {
  let workerFarm = createWorkerFarm();
  let parcel = new Parcel({ entries: entryPoints, workerFarm, ...options });

  let events = new Mailbox();

  yield spawn(function*() {
    let subscription: ParcelAsyncSubscription = yield parcel.watch(() => events.send({ type: 'update' }));

    try {
      yield;
    } finally {
      subscription.unsubscribe().finally(() => {
        workerFarm.end();
      });
    }
  });

  yield events.receive();

  if (process.send) {
    process.send({ type: 'ready', options: parcel.options });
  }

  while (true) {
    yield events.receive();
    if (process.send) {
      process.send({ type: 'update'});
    }
  };
}
