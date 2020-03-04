import { EventEmitter } from 'events';
import { Operation, monitor } from 'effection';
import { once } from '@bigtest/effection';

export type EventName = string | symbol;

export function watchError(emitter: EventEmitter): Operation {
  return monitor(function*() {
    let [error]: [Error] = yield once(emitter, 'error');
    throw error;
  });
}
