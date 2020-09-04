import { TestImplementation, Context, Step, Assertion } from './interfaces';

export function test<C extends Context>(description: string): TestBuilder<C> {
  return new TestBuilder<C>({
    description,
    steps: [],
    assertions: [],
    children: []
  });
}

export type Action<C extends Context, R extends Context | void> = (context: C) => Promise<R>;
export type Check<C extends Context> = (context: C) => Promise<void>;

export interface StepDefinition<C extends Context, R extends Context | void> {
  description: string;
  action: Action<C,R>;
}

export interface AssertionDefinition<C extends Context> {
  description: string;
  check: Check<C>;
}

export class TestBuilder<C extends Context> implements TestImplementation {
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

  step<R extends Context | void>(step: StepDefinition<C,R>): TestBuilder<R extends void ? C : C & R>;
  step<R extends Context | void>(description: string, action: Action<C,R>): TestBuilder<R extends void ? C : C & R>;
  step<R extends Context | void>(descriptionOrStep: StepDefinition<C,R> | string, action?: Action<C,R>): TestBuilder<R extends void ? C : C & R> {
    let step = typeof descriptionOrStep !== 'string' ? descriptionOrStep : {
      description: descriptionOrStep,
      action: action ? action : async () => {}
    };

    return new TestBuilder({
      ...this,
      steps: this.steps.concat(step as Step),
    });
  }

  assertion(assertion: AssertionDefinition<C>): TestBuilder<C>;
  assertion(description: string, check: Check<C>): TestBuilder<C>;
  assertion(descriptionOrAssertion: string | AssertionDefinition<C>, check?: Check<C>): TestBuilder<C> {
    let assertion = typeof descriptionOrAssertion !== 'string' ? descriptionOrAssertion : {
      description: descriptionOrAssertion,
      check: check ? check : async () => {}
    };

    return new TestBuilder({
      ...this,
      assertions: this.assertions.concat(assertion as Assertion),
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
