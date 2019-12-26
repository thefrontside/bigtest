import * as childProcess from 'child_process';
import { SpawnOptions } from 'child_process';

export function spawn(command: string, args?: ReadonlyArray<string>, options?: SpawnOptions) {
  return (execution) => {
    let child = childProcess.spawn(command, args, Object.assign({}, options, {
      detached: true,
    }));
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
    execution.atExit(() => process.kill(-child.pid, "SIGTERM"));
    execution.resume(child);
  }
}
