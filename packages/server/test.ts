import { Operation, Task, TaskHandle } from 'mini-effection';

function timeout(time): Operation<void> {
  return function*() {
    let timeout;
    let semaphore = new Promise((resolve, reject) => {
      timeout = setTimeout(resolve)
    });

    try {
      yield semaphore;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function *myGenerator() {
  yield timeout(200)
}

function main<T>(operation: Operation<T>): TaskHandle<T> {
  let task = new Task<T>();
  return new TaskHandle(task);
}

function spawn<T>(operation: Operation<T>): Operation<TaskHandle<T>> {
  return function*() {
    let task = new Task<T>();
    return new TaskHandle(task);
  };
}

main(function*() {
  yield spawn(function*() {
    yield timeout(200);
    yield myGenerator;
    yield function*() {

    };
  });
});
