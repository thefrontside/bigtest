import { EventEmitter } from 'events';
import { Execution } from 'effection';

type EventName = string | symbol;

/**
 * Takes an event emitter and event name and returns a yieldable
 * operation which resumes when the event occurrs.
 */
export function on(emitter: EventEmitter, eventName: EventName) {
  return (execution: Execution) => {
    let resume = (...args: unknown[]) => execution.resume(args);
    emitter.on(eventName, resume);
    return () => emitter.off(eventName, resume);
  }
}

export function watch(execution: Execution, emitter: EventEmitter, names: EventName | EventName[]) {
  for(let name of [].concat(names)) {
    let listener = (...args) => {
      execution.send({ event: name, args: args });
    }

    emitter.on(name, listener);
    execution.atExit(() => {
      emitter.off(name, listener);
    });
  }
}

export function watchError(execution: Execution, emitter: EventEmitter) {
  let listener = (error) => {
    execution.throw(error);
  }

  emitter.on("error", listener);
  execution.atExit(() => {
    emitter.off("error", listener);
  });
}
