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

type StepArgs<C extends Context, R extends Context | void> = [StepDefinition<C,R>] | [string, Action<C,R>];

function normalizeStepArgs<C extends Context, R extends Context | void>(stepArgs: StepArgs<C, R>): Step {
  if(typeof(stepArgs[0]) === 'string') {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let action = stepArgs[1] || ((async () => {}) as () => Promise<R>);

    return { description: stepArgs[0], action } as Step;
  } else {
    return stepArgs[0] as Step;
  }
}

type AssertionArgs<C extends Context> = [AssertionDefinition<C>] | [string, Check<C>];

function normalizeAssertionArgs<C extends Context>(stepArgs: AssertionArgs<C>): Assertion {
  if(typeof(stepArgs[0]) === 'string') {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let check = stepArgs[1] || (async () => {});

    return { description: stepArgs[0], check } as Assertion;
  } else {
    return stepArgs[0] as Assertion;
  }
}

function editDescription<Q extends { description: string }>(input: Q, cb: (value: string) => string): Q {
  input.description = cb(input.description);
  return input;
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

  step<R extends Context | void>(...args: StepArgs<C,R>): TestBuilder<R extends void ? C : C & R> {
    return new TestBuilder({
      ...this,
      steps: this.steps.concat(normalizeStepArgs(args)),
    });
  }

  given<R extends Context | void>(...args: StepArgs<C,R>): TestBuilder<R extends void ? C : C & R> {
    return new TestBuilder({
      ...this,
      steps: this.steps.concat(editDescription(normalizeStepArgs(args), (d) => `given ${d}`)),
    });
  }

  when<R extends Context | void>(...args: StepArgs<C,R>): TestBuilder<R extends void ? C : C & R> {
    return new TestBuilder({
      ...this,
      steps: this.steps.concat(editDescription(normalizeStepArgs(args), (d) => `when ${d}`)),
    });
  }

  assertion(...args: AssertionArgs<C>): TestBuilder<C> {
    return new TestBuilder({
      ...this,
      assertions: this.assertions.concat(normalizeAssertionArgs(args)),
    });
  }

  then(...args: AssertionArgs<C>): TestBuilder<C> {
    return new TestBuilder({
      ...this,
      assertions: this.assertions.concat(editDescription(normalizeAssertionArgs(args), (d) => `then ${d}`)),
    });
  }

  child(description: string, childFn: (inner: TestBuilder<C>) => TestBuilder<Context>): TestBuilder<C> {
    let child = childFn(test(description));
    return new TestBuilder({
      ...this,
      children: this.children.concat(child)
    });
  }

  test(description: string, childFn: (inner: TestBuilder<C>) => TestBuilder<Context>): TestBuilder<C> {
    return this.child(description, childFn);
  }
}
