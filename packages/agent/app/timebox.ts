import { Operation, spawn, timeout } from '../node_modules/effection';

export function* timebox<T>(operation: Operation<T>, timelimit: number): Operation<T> {
  yield spawn(
    yield timeout(timelimit)
  );

  return yield operation;
}
