export { strict as assert } from 'assert';
import { TestImplementation, Context, Step, Assertion, Check, Action } from '@bigtest/suite';

export function test<C extends Context>(description: string): TestBuilder<C> {
  return new TestBuilder<C>({
    description,
    steps: [],
    assertions: [],
    children: []
  });
}

class TestBuilder<C extends Context> implements TestImplementation {
  public description: string;
  public steps: Step[];
  public assertions: Assertion[];
  public children: TestImplementation[];

  constructor(test: TestImplementation) {
    this.description = test.description;
    this.steps = test.steps;
    this.assertions = test.assertions;
    this.children = test.children;
  }

  step<R extends Context | void>(description: string, action: (context: C) => PromiseLike<R>): TestBuilder<R extends void ? C : C & R> {
    return new TestBuilder({
      ...this,
      steps: this.steps.concat({
        description,
        action: action as Action
      }),
    });
  }

  assertion<R extends Context | void>(description: string, check: (context: C) => R): TestBuilder<R extends void ? C : C & R> {
    return new TestBuilder({
      ...this,
      assertions: this.assertions.concat({
        description,
        check: check as Check
      }),
    });
  }

  child(description: string, childFn: (inner: TestBuilder<C>) => TestBuilder<Context>): TestBuilder<C> {
    let child = childFn(test(description));
    return new TestBuilder({
      ...this,
      children: this.children.concat(child)
    });
  }
}
