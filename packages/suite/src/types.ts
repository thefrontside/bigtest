import { TestImplementation, Context } from './interfaces';

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

export type AssertionList<C extends Context> = [AssertionDefinition<C>, ...AssertionDefinition<C>[]];

export type ActionContext = Context | void;

export type ResolveContext<C extends Context, R extends ActionContext> = R extends void | undefined | null ? C : C & R;

export type Stepable<C extends Context> = {
  <R extends ActionContext>(
    step: StepDefinition<C, R>
  ): TestBuilderImplementation<ResolveContext<C, R>>;
  <R1 extends ActionContext, R2 extends ActionContext>(
    step1: StepDefinition<C, R1>,
    step2: StepDefinition<ResolveContext<C, R1>, R2>
  ): TestBuilderImplementation<ResolveContext<ResolveContext<C, R2>, R1>>;
  <R1 extends ActionContext, R2 extends ActionContext, R3 extends ActionContext>(
    step1: StepDefinition<C, R1>,
    step2: StepDefinition<ResolveContext<C, R1>, R2>,
    step3: StepDefinition<ResolveContext<ResolveContext<C, R1>, R2>, R3>
  ): TestBuilderImplementation<ResolveContext<ResolveContext<ResolveContext<C, R1>, R2>, R3>>;
  <
    R1 extends ActionContext,
    R2 extends ActionContext,
    R3 extends ActionContext,
    R4 extends ActionContext
  >(
    step1: StepDefinition<C, R1>,
    step2: StepDefinition<ResolveContext<C, R1>, R2>,
    step3: StepDefinition<ResolveContext<ResolveContext<C, R1>, R2>, R3>,
    step4: StepDefinition<ResolveContext<ResolveContext<ResolveContext<C, R1>, R2>, R3>, R4>
  ): TestBuilderImplementation<ResolveContext<ResolveContext<ResolveContext<ResolveContext<C, R1>, R2>, R3>, R4>>;
  <
    R1 extends ActionContext,
    R2 extends ActionContext,
    R3 extends ActionContext,
    R4 extends ActionContext,
    R5 extends ActionContext
  >(
    step1: StepDefinition<C, R1>,
    step2: StepDefinition<ResolveContext<C, R1>, R2>,
    step3: StepDefinition<ResolveContext<ResolveContext<C, R1>, R2>, R3>,
    step4: StepDefinition<ResolveContext<ResolveContext<ResolveContext<C, R1>, R2>, R3>, R4>,
    step5: StepDefinition<ResolveContext<ResolveContext<ResolveContext<ResolveContext<C, R1>, R2>, R3>,R4>,R5>
  ): TestBuilderImplementation<ResolveContext<ResolveContext<ResolveContext<ResolveContext<ResolveContext<C, R1>, R2>, R3>, R4>, R5>>;
  <
    R1 extends ActionContext,
    R2 extends ActionContext,
    R3 extends ActionContext,
    R4 extends ActionContext,
    R5 extends ActionContext,
    R6 extends ActionContext
  >(
    step1: StepDefinition<C, R1>,
    step2: StepDefinition<ResolveContext<C, R1>, R2>,
    step3: StepDefinition<ResolveContext<ResolveContext<C, R1>, R2>, R3>,
    step4: StepDefinition<ResolveContext<ResolveContext<ResolveContext<C, R1>, R2>, R3>, R4>,
    step5: StepDefinition<ResolveContext<ResolveContext<ResolveContext<ResolveContext<C, R1>, R2>, R3>, R4>,R5>,
    step6: StepDefinition<ResolveContext<ResolveContext<ResolveContext<ResolveContext<ResolveContext<C, R1>, R2>,R3>,R4>,R5>,R6>
  ): TestBuilderImplementation<ResolveContext<ResolveContext<ResolveContext<ResolveContext<ResolveContext<ResolveContext<C, R1>, R2>, R3>,R4>,R5>, R6>>;
  <R extends ActionContext>(description: string, action: Action<C, R>): TestBuilderImplementation<ResolveContext<C, R>>;
  <R extends ActionContext>(...args: StepDefinition<C, R>[] | [string, Action<C, R>]): TestBuilderImplementation<ResolveContext<C, R>>;
}

export type TestBuilderImplementation<C extends Context> = TestImplementation & {
  step: Stepable<C>;
  assertion(...assertions: AssertionList<C>): TestBuilderImplementation<C>;
  assertion(description: string, check: Check<C>): TestBuilderImplementation<C>;
  child(description: string, childFn: (inner: TestBuilderImplementation<C>) => TestBuilderImplementation<Context>): TestBuilderImplementation<C>;
}

