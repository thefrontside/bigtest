import { Sequence, Execution, fork } from 'effection';
import { EventEmitter } from  'events';

export abstract class Process extends EventEmitter {
  private execution?: Execution;

  start(): Promise<any> {
    return new Promise((ready) => {
      if(!this.execution) {
        this.execution = fork(this.run(ready));
      }
    });
  }

  stop() {
    if(this.execution) {
      this.execution.halt();
    }
  }

  *run(ready): Sequence {}
}

