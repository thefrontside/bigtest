import { Sequence, Execution, fork } from 'effection';
import { EventEmitter } from  'events';

export abstract class Process extends EventEmitter {
  private execution?: Execution;
  public ready: Promise<any>;

  constructor() {
    super();
    this.ready = new Promise((resolve) => {
      this.once("ready", resolve);
    });
  }

  start() {
    if(!this.execution) {
      this.execution = fork(this.run());
    }
  }

  stop() {
    if(this.execution) {
      this.execution.halt();
    }
  }

  *run(): Sequence {}

  protected isReady = () => {
    this.emit("ready")
  }
}

