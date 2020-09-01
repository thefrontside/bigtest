import { TestImplementation, Context, Step, Assertion, Check, Action } from './interfaces';

export function test<C extends Context>(description: string): TestBuilder<C> {
  return new TestBuilder<C>({
    description,
    steps: [],
    assertions: [],
    children: []
  });
}

type ActionArgument<R extends Context | void, C extends Context> = Promise<R> | ((context: C) => Promise<R>);
type CheckArgument<C extends Context> = ActionArgument<void, C>;

type StepUnit<R extends Context | void, C extends Context> = ActionArgument<R, C> & { description: string };
type AssertionUnit<C extends Context> = CheckArgument<C> & { description: string };

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

  step<R extends Context | void>(description: string, action: ActionArgument<R, C>): TestBuilder<R extends void ? C : C & R>
  step<R extends Context | void>(unit: StepUnit<R, C>): TestBuilder<R extends void ? C : C & R>
  step<R extends Context | void>(
    ...args: [string, ActionArgument<R, C>] | [ActionArgument<R, C> & { description: string }]
  ): TestBuilder<R extends void ? C : C & R> {
    let [description, actionOrPromise] = (args.length === 1) ? [args[0].description, args[0]] : args;
    let action = typeof(actionOrPromise) === 'function' ? actionOrPromise : async () => { return await actionOrPromise }

    return new TestBuilder({
      ...this,
      steps: this.steps.concat({ description, action: action as Action }),
    });
  }

  assertion(description: string, check: CheckArgument<C>): TestBuilder<C>;
  assertion(unit: AssertionUnit<C>): TestBuilder<C>;
  assertion(
    ...args: [string, CheckArgument<C>] | [CheckArgument<C> & { description: string }]
  ): TestBuilder<C> {
    let [description, checkOrPromise] = (args.length === 1) ? [args[0].description, args[0]] : args;
    let check = typeof(checkOrPromise) === 'function' ? checkOrPromise : async () => { return await checkOrPromise }

    return new TestBuilder({
      ...this,
      assertions: this.assertions.concat({ description, check: check as Check }),
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
