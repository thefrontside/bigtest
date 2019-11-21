import { Sequence, Execution, fork } from 'effection';
import { EventEmitter } from  'events';

export abstract class Process extends EventEmitter {
  private execution?: Execution;

  start(): Promise<any> {
    let that = this;
    return new Promise((ready) => {
      if(!this.execution) {
        this.execution = fork(function*() {
          try {
            yield that.run(ready);
          } finally {
            that.execution = null;
          }
        });
      }
    });
  }

  stop() {
    if(this.execution) {
      this.execution.halt();
      this.execution = null;
    }
  }

  protected *run(ready): Sequence {}
}

