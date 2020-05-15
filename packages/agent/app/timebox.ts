import { Operation, spawn, timeout } from 'effection';

export function* timebox<T>(operation: Operation<T>, timelimit: number): Operation<T> {
  yield spawn(function*(): Operation<void> {
    yield timeout(timelimit);
    let error = new Error(`timelimit of ${timelimit}ms exceeded`);
    error.name = 'TimeoutError';
    throw error;
  });

  return yield operation;
}
