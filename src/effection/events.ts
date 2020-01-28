import { EventEmitter } from 'events';
import { Controller } from 'effection';

type EventName = string | symbol;

/**
 * Takes an event emitter and event name and returns a yieldable
 * operation which resumes when the event occurrs.
 */
export function on(emitter: EventEmitter, eventName: EventName): Controller {
  return (execution) => {
    let resume = (...args: unknown[]) => execution.resume(args);
    emitter.on(eventName, resume);
    return () => emitter.off(eventName, resume);
  }
}

function defaultPrepareMessage(...args) {
  return { event: this.event, args: args };
}

export function watch(
  emitter: EventEmitter,
  names: EventName | EventName[],
  prepare: (...args: any[]) => any = defaultPrepareMessage // eslint-disable-line @typescript-eslint/no-explicit-any
): Controller {
  return (execution) => {
    for(let name of [].concat(names)) {
      let listener = (...args) => {
        execution.send(prepare.apply({ event: name }, args));
      }

      emitter.on(name, listener);
      execution.atExit(() => {
        emitter.off(name, listener);
      });
    }
    execution.resume(emitter);
  }
}

export function watchError(emitter: EventEmitter): Controller {
  return (execution) => {
    let listener = (error) => {
      execution.throw(error);
    }

    emitter.on("error", listener);
    execution.atExit(() => {
      emitter.off("error", listener);
    });
    execution.resume(emitter);
  }
}
