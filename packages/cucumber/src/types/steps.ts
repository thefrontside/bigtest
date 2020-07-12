import { CucumberExpression, RegularExpression } from 'cucumber-expressions';
import { Context, Step, Action, Check } from '@bigtest/suite';

export type StepCode<A extends unknown[], R extends Context> = (...args: A) => R;

export type AssertionCode<A extends unknown[]> = (...args: A) => void;

export type StepDefinitionPattern = CucumberExpression | RegularExpression;

export enum StepDefinitionType {
  Step = 'Step',
  Assertion = 'Assertion',
}

export type DefineStep = <A extends unknown[], R extends Context>(
  pattern: string | RegExp,
  code: StepCode<A, R>,
) => void;

export type DefineAssertion = <A extends unknown[]>(pattern: string | RegExp, code: AssertionCode<A>) => void;

export interface StepDefinition<A extends unknown[], R extends Context> {
  code: StepCode<A, R>;

  expression: StepDefinitionPattern;
  type: StepDefinitionType;
}

export type StepOrAssertion = Step & {
  action: Action | Check;
  type: StepDefinitionType;
};
