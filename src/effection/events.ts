import { EventEmitter } from 'events';
import { Operation, send, fork, monitor } from 'effection';

type EventName = string | symbol;

/**
 * Takes an event emitter and event name and returns a yieldable
 * operation which resumes when the event occurrs.
 */
export function on(emitter: EventEmitter, eventName: EventName): Operation {
  return (control) => {
    let resume = (...args: unknown[]) => control.resume(args);
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
): Operation {
  return ({ resume, context: { parent }}) => {
    let parentContext = parent as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    for(let name of [].concat(names)) {
      let listener = (...args) => {
        parentContext.spawn(fork(function*() {
          yield send(prepare.apply({ event: name}, args), parentContext);
        }));
      }

      emitter.on(name, listener);

      parentContext.ensure(() => {
        emitter.off(name, listener);
      });

      resume(emitter);
    }
  }
}

export function watchError(emitter: EventEmitter): Operation {
  return monitor(function*() {
    let [error]: [Error] = yield on(emitter, 'error');
    throw error;
  });
}
