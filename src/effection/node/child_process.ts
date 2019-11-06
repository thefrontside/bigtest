import { EventEmitter } from '@effection/events';
import * as cp from 'child_process';

export function spawn(cmd: string, args: string[], options: cp.SpawnOptions) {
  return new ChildProcess(cp.spawn(cmd, args, options))
}

class ChildProcess extends EventEmitter<cp.ChildProcess, "error" | "exit"> {

  kill(signal?: string) {
    this.inner.kill(signal);
  }
}
