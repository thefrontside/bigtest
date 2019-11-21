import { Operation, Execution, fork } from 'effection';

type Process = Execution & { started: Promise<void> };

export function process(fn: (started: () => void) => Operation): Process {
  let execution;
  let promise = new Promise((resolve) => {
    execution = fork(fn(resolve));
  });
  execution.started = promise;
  return execution;
}
