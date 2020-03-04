import { Operation } from 'effection';
import { EventEmitter } from 'events';

/**
 * Takes an event emitter and event name and returns a yieldable
 * operation which resumes when the event occurs.
 */
export function once(emitter: EventEmitter, eventName: string): Operation {
  return ({ resume, ensure }) => {
    let listener = (...args: unknown[]) => resume(args);
    ensure(() => emitter.off(eventName, listener));

    emitter.on(eventName, listener);
  };
}
