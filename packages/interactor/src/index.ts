interface Constructor<Klass, Args extends any[] = []> {
  new (...args: Args): Klass;
}

interface Collection<T extends Interactor> extends Iterable<T> {
  first(): T;
  second(): T;
  third(): T;
  last(): T;
  where(selector: string): this;
  select<U extends Interactor>(interactor: Constructor<U>, selector?: string): Collection<U>;
}

export declare class Interactor {
  static first<T extends Interactor>(this: Constructor<T>): T;
  static second<T extends Interactor>(this: Constructor<T>): T;
  static third<T extends Interactor>(this: Constructor<T>): T;
  static last<T extends Interactor>(this: Constructor<T>): T;

  static select<T extends Interactor, U extends Interactor>(
    this: Constructor<T>,
    interactor: Constructor<U>,
    selector?: string
  ): Collection<U>;
  static where<T extends Interactor>(this: Constructor<T>, selector?: string): Collection<T>;

  click(): Promise<void>;
  fill(content: string): Promise<void>;
}
