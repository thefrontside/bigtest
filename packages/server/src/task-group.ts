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
