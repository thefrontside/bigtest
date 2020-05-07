import { spawn, Operation } from 'effection';

export function * parallel<T = unknown>(operations: Operation<T>[]): Operation<T[]> {
  let tasks = [];
  for (let operation of operations) {
    tasks.push(yield spawn(operation));
  }
  return yield Promise.all(tasks);
}
