import { Sequence, Execution, fork } from 'effection';
import { EventEmitter } from  'events';

export abstract class Process extends EventEmitter {
  private execution?: Execution;

  start(): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
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

  // eslint-disable-next-line
  protected *run(ready: () => void): Sequence {}
}

