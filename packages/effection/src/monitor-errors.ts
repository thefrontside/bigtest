import { EventSource } from './event-source';
import { Operation, monitor } from 'effection';
import { once } from './events';

export function monitorErrors(source: EventSource): Operation {
  return monitor(function*() {
    let [error]: [Error] = yield once(source, 'error');
    throw error;
  });
}
