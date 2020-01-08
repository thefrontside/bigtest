import { Controller, Execution } from 'effection';
import { on } from '@effection/events';

import * as childProcess from 'child_process';
import { SpawnOptions, ForkOptions, ChildProcess } from 'child_process';

export { ChildProcess } from 'child_process'

function supervise(execution: Execution, child: ChildProcess) {
  // Killing all child processes started by this command is surprisingly
  // tricky. If a process spawns another processes and we kill the parent,
  // then the child process is NOT automatically killed. Instead we're using
  // the `detached` option to force the child into its own process group,
  // which all of its children in turn will inherit. By sending the signal to
  // `-pid` rather than `pid`, we are sending it to the entire process group
  // instead. This will send the signal to all processes started by the child
  // process.
  //
  // More information here: https://unix.stackexchange.com/questions/14815/process-descendants
  execution.atExit(() => {
    try {
      process.kill(-child.pid, "SIGTERM")
    } catch(e) {
      // do nothing, process is probably already dead
    }
  });
  execution.monitor(function*() {
    let [error]: [Error] = yield on(child, "error");
    throw error;
  });

  execution.monitor(function*() {
    let [code]: [number] = yield on(child, "exit");
    if(code !== 0) { throw new Error("child exited with non-zero exit code") }
  });
}

export function spawn(command: string, args?: ReadonlyArray<string>, options?: SpawnOptions): Controller {
  return (execution) => {
    let child = childProcess.spawn(command, args, Object.assign({}, options, {
      shell: true,
      detached: true,
    }));
    supervise(execution, child);
    execution.resume(child);
  }
}

export function fork(module: string, args?: ReadonlyArray<string>, options?: ForkOptions): Controller {
  return (execution) => {
    let child = childProcess.fork(module, args, Object.assign({}, options, {
      detached: true,
    }));
    supervise(execution, child);
    execution.resume(child);
  }
}
