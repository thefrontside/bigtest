import { Operation, Task, spawn, label } from 'effection';
import assert from 'assert-ts';

export interface TaskGroup {
  spawn<T>(operation: Operation<T>): Operation<Task<T>>;
  allSettled(): Operation<void>;
}

export interface Create<T> {
  [Symbol.iterator](): Iterator<Operation<T>, T, T>;
}

export function* createTaskGroup(name = 'task group'): Create<TaskGroup> {
  let tasks = new Set<Task>();

  return yield {
    name,
    *init(scope) {
      return {
        *spawn<T>(operation: Operation<T>) {
          let task: Task<T> | undefined;
          yield spawn(function*() {
            task = (yield scope.spawn(operation)) as Task<T>;
            tasks.add(task);
            try {
              yield task.future;
            } finally {
              tasks.delete(task);
            }
          });
          assert(!!task, "task was not initialized");
          return task;
        },
        *allSettled() {
          yield label({ name: `${name}.allSettled()`});
          while (tasks.size > 0) {
            for (let task of tasks) {
              yield task.future;
            }
          }
        }
      };
    }
  }
}
