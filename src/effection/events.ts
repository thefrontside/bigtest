import * as events from 'events';
import { Execution } from 'effection';

/**
 * Takes an event emitter and event name and returns a yieldable
 * operation which resumes when the event occurrs.
 */
export function on(emitter: events.EventEmitter, eventName: string | symbol) {
  return (execution: Execution) => {
    let resume = (...args: unknown[]) => execution.resume(args);
    emitter.on(eventName, resume);
    return () => emitter.off(eventName, resume);
  }
}
