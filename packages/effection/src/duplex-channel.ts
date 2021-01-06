import { subscribe, ChainableSubscribable } from '@effection/subscription';
import { Channel } from '@effection/channel';

export interface Sendable<T> {
  send(message: T): void;
}

export type DuplexChannel<S, R, RReturn = undefined> = ChainableSubscribable<R, RReturn> & Sendable<S>;

export type DuplexPair<Tx, Rx> = [DuplexChannel<Tx, Rx>, DuplexChannel<Rx, Tx>];

export function createDuplexChannel<Tx, Rx>(options: { maxListeners?: number } = {}): DuplexPair<Tx, Rx> {
  let tx = new Channel<Tx>();
  let rx = new Channel<Rx>();

  if(options.maxListeners) {
    tx.setMaxListeners(options.maxListeners);
    rx.setMaxListeners(options.maxListeners);
  }

  return [
    Object.assign(subscribe(rx), {
      send: (value: Tx) => tx.send(value)
    }),
    Object.assign(subscribe(tx), {
      send: (value: Rx) => rx.send(value)
    }),
  ];
}
