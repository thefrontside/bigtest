import { Operation, spawn, timeout } from 'effection';

export function* timebox<T>(operation: Operation<T>, timelimit: number): Operation<T> {
  yield spawn(function*(): Operation<void> {
    yield timeout(timelimit);
  });

  return yield operation;
}
