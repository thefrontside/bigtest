import { Operation, Context } from 'effection';

export class Variable<T> {
  symbol: symbol;

  constructor(name: string) {
    this.symbol = Symbol(`Variable<${name}>`);
  }

  *using(value: T, operation: Operation): Operation {
    yield this.set(value);
    return yield operation;
  }

  set(value: T): Operation {
    return ({ resume, context: { parent } }) => {
      parent[this.symbol] = value;
      resume(value);
    };

  }

  get(): Operation {
    return ({ resume, fail, context }) => {
      for (let current: Context = context; !!current; current = current.parent) {
        if (current.hasOwnProperty(this.symbol)) {
          resume(current[this.symbol]);
          return;
        }
      }
      fail(new Error(`Unable to find a value for ${String(this.symbol)} anywhere on the stack`));
    }
  }
}
