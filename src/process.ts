import { Operation, Execution, fork } from 'effection';

type Process = Execution & { ready: Promise<void> };

export function process(fn: (ready: () => void) => Operation): Process {
  let execution;
  let promise = new Promise((resolve) => {
    execution = fork(fn(resolve));
  });
  execution.ready = promise;
  return execution;
}
