import { EventEmitter } from 'events';
import { Operation, monitor } from 'effection';
import { once } from './events';

export function monitorErrors(emitter: EventEmitter): Operation {
  return monitor(function*() {
    let [error]: [Error] = yield once(emitter, 'error');
    throw error;
  });
}
