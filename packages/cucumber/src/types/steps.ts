import { CucumberExpression, RegularExpression } from 'cucumber-expressions';
import { Context, Step, Action, Check } from '@bigtest/suite';

export type StepCode<A extends unknown[]> = (...args: A) => Context | void;

export type StepDefinitionPattern = CucumberExpression | RegularExpression;

export enum StepDefinitionType {
  Step = 'Step',
  Assertion = 'Assertion',
}

export type DefineStep = <A extends unknown[], R>(pattern: string | RegExp, code: StepCode<A>) => void;

export interface StepDefinition<A extends unknown[]> {
  code: StepCode<A>;
  expression: StepDefinitionPattern;
  type: StepDefinitionType;
}

export type StepOrAssertion = Step & {
  action: Action | Check;
  type: StepDefinitionType;
};
