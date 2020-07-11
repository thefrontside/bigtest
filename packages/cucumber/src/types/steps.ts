import { CucumberExpression, RegularExpression } from 'cucumber-expressions';

export type DefineStepOptions = {
  timeout?: number;
};

export type StepCode<A extends unknown[], R> = (...args: A) => R;

export type StepDefinitionPattern = CucumberExpression | RegularExpression;

export type DefineStep = <A extends unknown[], R>(pattern: string | RegExp, code: StepCode<A, R>) => void;

export interface StepDefinition<A extends unknown[], R> {
  code: StepCode<A, R>;
  expression: StepDefinitionPattern;
  options: DefineStepOptions;
}
