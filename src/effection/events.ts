import * as events from 'events';
import { Operation, Execution } from 'effection';

export class EventEmitter<T extends events.EventEmitter, E extends string | symbol> {
  constructor(protected inner: T) {}

  on(event: E): Operation {
    return (execution: Execution) => {
      let resume = (...args) => execution.resume(args);
      this.inner.on(event, resume);
      return () => this.inner.off(event, resume);
    }
  }
}
