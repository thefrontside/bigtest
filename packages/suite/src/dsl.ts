import { TestImplementation, Context, Step, Assertion } from './interfaces';
import { Stepable, ActionContext, StepDefinition, Action, ResolveContext, AssertionList, Check, TestBuilderImplementation } from './types';


export function test<C extends Context>(description: string): TestBuilder<C> {
  return new TestBuilder<C>({
    description,
    steps: [],
    assertions: [],
    children: []
  });
}

export class TestBuilder<C extends Context> implements TestBuilderImplementation<C> {
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

  step: Stepable<C> =  <R extends ActionContext>(...args: StepDefinition<C, R>[] | [string, Action<C, R>]): TestBuilder<ResolveContext<C, R>> => {
    function getSteps(): Step[] {
      let [first, second] = args;
      if (typeof first === 'string') {
        return [{
          description: first,
          action: second ? second : async () => undefined
        }] as Step[];
      } else {
        return args as Step[];
      }
    }

    return new TestBuilder({
      ...this,
      steps: this.steps.concat(getSteps()),
    });
  }

  assertion(...assertions: AssertionList<C>): TestBuilder<C>;
  assertion(description: string, check: Check<C>): TestBuilder<C>;
  assertion(...args: [string, Check<C>] | AssertionList<C>): TestBuilder<C> {

    function getAssertions(): Assertion[] {
      let [first, second] = args;
      if (typeof first === 'string') {
        return [{
          description: first,
          check: second ? second : async () => undefined
        }] as Assertion[]
      } else {
        return args as Assertion[];
      }
    }

    return new TestBuilder({
      ...this,
      assertions: this.assertions.concat(getAssertions()),
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
