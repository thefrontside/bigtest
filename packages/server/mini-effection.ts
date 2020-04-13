type TaskState = "unstarted" | "pending" | "running" | "waiting" | "completed" | "failed" | "halted";

type GeneratorFunctionOperation<T> = () => Iterator<Operation<unknown>, T>;
type Operation<T> = Promise<T> | GeneratorFunctionOperation<T>

function isDone(state: TaskState): boolean {
  return state === 'completed' || state === 'failed' || state === 'halted';
}

interface Controller<T> {
  start(controls: Controls<T>): void;
  halt(): void;
}

class PromiseTaskController<T> implements Controller {
  public state: TaskState = "unstarted";
  public result: T | undefined = undefined;

  constructor(private promise: Promise<T>) {
  }

  start(controls: Controls<T>) {
    this.state = 'pending';
    this.promise.then((value) => {
      if(this.state === 'pending') {
        controls.resolve(value);
      }
    }, (error) => {
      if(this.state === 'pending') {
        controls.reject(error);
      }
    });
  }

  halt() {
    this.state = 'halted';
    this.controls.reject(new Error('halted'));
  }
}

class GeneratorTaskController<T> implements Controller {
  private generator: Iterator<Operation<unknown>, T>;

  public state: TaskState = "unstarted";
  public result: T | undefined = undefined;

  private subscriptions: WeakSet<() => void> = new WeakSet();

  constructor(private controls: Controls<T>, private generatorFn: GeneratorFunctionOperation<T>) {
    this.generator = generatorFn();
  }

  start() {

  }

  halt() {
    this.generator.return();
  }

  advance(getNext) {
    try {
      let next = getNext();
      if (next.done) {
        this.result = next.value;
        this.transition('completed');
      } else {
        ctls = {
          resolve: m
          reject:
        }
        next.value.continue(ctls);
        this.advance(() =>
        this.fork(next.value);
      }
    } catch (error) {
      this.fail(error);
    }
  }

  continue(ctls) {
    let listener = () => {
      if(this.state === 'completed') {
        ctls.resolve(this.result);
        this.subscriptions.delete(listener);
      }
      if(this.state === 'failed') {
        ctls.reject(this.result);
        this.subscriptions.delete(listener);
      }
      if(this.state === 'halted') {
        ctls.reject(new Error("halted"));
        this.subscriptions.delete(listener);
      }
    }
    this.subscriptions.add(listener);
  }

  transition(state) {
    this.state = state;
    for(subscription of this.subscriptions) {
      subscription();
    }
  }
}

// provides a "safe" interface around the task internals
class Task<T> {
  constructor(private _internal: TaskController<T>) {}

  static of(operation: Operation<T>): Task<T> {
    if(typeof operation.then === 'function') {
      new Task(new PromiseTaskController(operation)) {
      }
    } else {
      new Task(new GeneratorTaskController(operation)) {
    }
  }

  get state(): TaskState {
    return this._internal.state;
  }

  get result(): T | undefined {
    return this._internal.result;
  }

  halt() {
    this._internal.halt();
  }
}

interface Controls<T> {
  resolve(result?: T): void;
  reject(error: Error): void;
  ensure(handler: () => void): void;
  halt(): void;
  spawn<C>(operation: Operation<C>): Task<C>;
  fork<C>(operation: Operation<C>): Task<C>;
}
