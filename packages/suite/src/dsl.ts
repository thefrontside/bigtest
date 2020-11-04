import { TestImplementation, Context, Step, Assertion } from './interfaces';

export function test<C extends Context>(description: string): TestBuilder<C> {
  return new TestBuilder<C>({
    description,
    steps: [],
    assertions: [],
    children: []
  });
}

export type Action<C extends Context, R extends Context | void> = (context: C) => Promise<R> | R;
export type Check<C extends Context> = (context: C) => Promise<void> | void;

export interface StepDefinition<C extends Context, R extends Context | void> {
  description: string;
  action: Action<C,R>;
}

export interface AssertionDefinition<C extends Context> {
  description: string;
  check: Check<C>;
}

type AssertionList<C extends Context> = [AssertionDefinition<C>, ...AssertionDefinition<C>[]];

type StepReturn = Context | void;

type ResolveStepReturn<C extends Context, R extends StepReturn> = R extends void | undefined ? C : C & R;

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


  step<R extends StepReturn>(
    step: StepDefinition<C, R>
  ): TestBuilder<ResolveStepReturn<C, R>>;
  step<R1 extends StepReturn, R2 extends StepReturn>(
    step1: StepDefinition<C, R1>,
    step2: StepDefinition<ResolveStepReturn<C, R1>, R2>
  ): TestBuilder<ResolveStepReturn<ResolveStepReturn<C, R2>, R1>>;
  step<R1 extends StepReturn, R2 extends StepReturn, R3 extends StepReturn>(
    step1: StepDefinition<C, R1>,
    step2: StepDefinition<ResolveStepReturn<C, R1>, R2>,
    step3: StepDefinition<ResolveStepReturn<ResolveStepReturn<C, R1>, R2>, R3>
  ): TestBuilder<ResolveStepReturn<ResolveStepReturn<C, R1>, R2>>;
  step<
    R1 extends StepReturn,
    R2 extends StepReturn,
    R3 extends StepReturn,
    R4 extends StepReturn
  >(
    step1: StepDefinition<C, R1>,
    step2: StepDefinition<ResolveStepReturn<C, R1>, R2>,
    step3: StepDefinition<ResolveStepReturn<ResolveStepReturn<C, R1>, R2>, R3>,
    step4: StepDefinition<ResolveStepReturn<ResolveStepReturn<ResolveStepReturn<C, R1>, R2>, R3>, R4>
  ): TestBuilder<ResolveStepReturn<ResolveStepReturn<C, R2>, R1>>;
  step<
    R1 extends StepReturn,
    R2 extends StepReturn,
    R3 extends StepReturn,
    R4 extends StepReturn,
    R5 extends StepReturn
  >(
    step1: StepDefinition<C, R1>,
    step2: StepDefinition<ResolveStepReturn<C, R1>, R2>,
    step3: StepDefinition<ResolveStepReturn<ResolveStepReturn<C, R1>, R2>, R3>,
    step4: StepDefinition<ResolveStepReturn<ResolveStepReturn<ResolveStepReturn<C, R1>, R2>, R3>, R4>,
    step5: StepDefinition<ResolveStepReturn<ResolveStepReturn<ResolveStepReturn<ResolveStepReturn<C, R1>, R2>, R3>,R4>,R5>
  ): TestBuilder<ResolveStepReturn<ResolveStepReturn<ResolveStepReturn<C, R1>, R2>, R3>>;
  step<
    R1 extends StepReturn,
    R2 extends StepReturn,
    R3 extends StepReturn,
    R4 extends StepReturn,
    R5 extends StepReturn,
    R6 extends StepReturn
  >(
    step1: StepDefinition<C, R1>,
    step2: StepDefinition<ResolveStepReturn<C, R1>, R2>,
    step3: StepDefinition<ResolveStepReturn<ResolveStepReturn<C, R1>, R2>, R3>,
    step4: StepDefinition<ResolveStepReturn<ResolveStepReturn<ResolveStepReturn<C, R1>, R2>, R3>, R4>,
    step5: StepDefinition<ResolveStepReturn<ResolveStepReturn<ResolveStepReturn<ResolveStepReturn<C, R1>, R2>, R3>, R4>,R5>,
    step6: StepDefinition<ResolveStepReturn<ResolveStepReturn<ResolveStepReturn<ResolveStepReturn<ResolveStepReturn<C, R1>, R2>,R3>,R4>,R5>,R6>
  ): TestBuilder<ResolveStepReturn<ResolveStepReturn<ResolveStepReturn<ResolveStepReturn<ResolveStepReturn<C, R1>, R2>, R3>,R4>,R5>>;
  step<R extends StepReturn>(description: string, action: Action<C, R>): TestBuilder<ResolveStepReturn<C, R>>;
  step<R extends StepReturn>(...args: StepDefinition<C, R>[] | [string, Action<C, R>]): TestBuilder<ResolveStepReturn<C, R>> {

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
