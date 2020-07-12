import { CucumberExpression, RegularExpression } from 'cucumber-expressions';
import { Context } from '@bigtest/suite';

export type DefineStepOptions = {
  timeout?: number;
};

export type StepCode<A extends unknown[]> = (...args: A) => Promise<Context>;

export type StepDefinitionPattern = CucumberExpression | RegularExpression;

export type DefineStep = <A extends unknown[], R>(pattern: string | RegExp, code: StepCode<A>) => void;

export interface StepDefinition<A extends unknown[]> {
  code: StepCode<A>;
  expression: StepDefinitionPattern;
  options: DefineStepOptions;
}
