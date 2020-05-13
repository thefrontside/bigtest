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
    let implementation = {
      description: this.description,
      steps: this.steps.concat({
        description,
        action: action as Action
      }),
      assertions: this.assertions,
      children: this.children
    }
    return new TestBuilder(implementation);
  }

  assertion<R extends Context | void>(description: string, check: (context: C) => R): TestBuilder<R extends void ? C : C & R> {
    let implementation = {
      description: this.description,
      steps: this.steps,
      assertions: this.assertions.concat({
        description,
        check: check as Check
      }),
      children: this.children
    }
    return new TestBuilder(implementation);
  }

  child(description: string, childFn: (inner: TestBuilder<C>) => TestBuilder<Context>): TestBuilder<C> {
    let child = childFn(test(description));
    let implementation = {
      description: this.description,
      steps: this.steps,
      assertions: this.assertions,
      children: this.children.concat(child)
    }
    return new TestBuilder(implementation);
  }
}
