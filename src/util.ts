import { fork, Execution, Operation } from 'effection';
import * as events from 'events';

//eslint-disable-next-line @typescript-eslint/no-empty-function
const Fork = fork(function*() {}).constructor;

/**
 * When using effection, there is only one Execution that is
 * active at a time given the single threaded nature of
 * JavaScript. This retreives it.
 *
 * This is a total hack and should be added to the public
 * effection API
 */
export function getCurrentExecution(): Execution {
  return Fork["currentlyExecuting"] as Execution;
}

/**
 * Takes the common Node pattern of a callback with an error
 * parameter, and wraps it to return a yieldable Operation
 * instead.
 */
export function resumeOnCb(fn: (cb: (error?: Error) => void) => void): Operation {
  return (execution: Execution<void>) => {
    let iCare = true;
    fn((error: Error) => {
      if (iCare) {
        if (error) {
          execution.throw(error);
        } else {
          execution.resume();
        }
      }
    });
    return () => iCare = false;
  }
}

/**
 * Takes an event emitter and event name and returns a yieldable
 * operation which resumes when the event occurrs.
 */
export function resumeOnEvent(emitter: events.EventEmitter, eventName: string | symbol): Operation {
  return (execution: Execution) => {
    let resume = (...args) => execution.resume(args);
    emitter.on(eventName, resume);
    return () => emitter.off(eventName, resume);
  }
}

export class EventEmitter<T extends events.EventEmitter, E extends string | symbol> {
  constructor(protected inner: T) {}

  on(event: E): Operation {
    return resumeOnEvent(this.inner, event);
  }
}
