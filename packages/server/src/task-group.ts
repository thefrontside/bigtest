import { Operation, Resource, Task, spawn } from 'effection';
import assert from 'assert-ts';

export interface TaskGroup extends Resource<void> {
  spawn<T>(operation: Operation<T>): Operation<Task<T>>;
}

export function createTaskGroup(name = 'task group'): Resource<TaskGroup> {
  let tasks = new Set<Task>();

  return {
    name,
    *init(scope) {
      return {
        *spawn<T>(operation: Operation<T>) {
          let task: Task<T> | undefined;
          yield spawn(function*() {
            let t: Task<T> = task = yield scope.spawn(operation);
            tasks.add(t);
            try {
              yield t.future;
            } finally {
              tasks.delete(t);
            }
          });
          assert(!!task, "task was not initialized");
          return task;
        },
        *init() {
          for (let task of tasks) {
            yield task.future;
          }
        },
        name: `await ${name}`,
      }
    }
  }
}
