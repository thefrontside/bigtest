import { EventEmitter } from 'events';
import { Operation, monitor } from 'effection';
export { Mailbox, any } from './events/mailbox';

export type EventName = string | symbol;

/**
 * Takes an event emitter and event name and returns a yieldable
 * operation which resumes when the event occurrs.
 */
export function on(emitter: EventEmitter, eventName: EventName): Operation {
  return ({ resume, ensure }) => {
    let handle = (...args: unknown[]) => resume(args);
    emitter.on(eventName, handle);
    ensure(() => emitter.off(eventName, handle));
  }
}

/**
 * Takes an event emmitter and an event name, and runs the operation
 * returned by the `each` function every time an event with
 * `eventName` is received.
 */
export function onEach(source: EventEmitter, event: EventName, each: (...args: unknown[]) => Operation): Operation {
  return ({ spawn, ensure }) => {
    let dispatch = (...args: unknown[]) => spawn(monitor(each(...args)))

    source.on(event, dispatch);
    ensure(() => source.off(event, dispatch));
  }
}

export function watchError(emitter: EventEmitter): Operation {
  return monitor(function*() {
    let [error]: [Error] = yield on(emitter, 'error');
    throw error;
  });
}
