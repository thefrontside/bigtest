import { StepDefinition, defineStep as defineCucumberStep } from 'cucumber';
import { ParameterTypeRegistry, CucumberExpression } from 'cucumber-expressions';

export type StepDefinitionCode<A extends unknown[], C> = (...args: A) => C | void;
export type DefineStepPattern = string | RegExp;

export class StepRegistry {
  cucumberExpressionParamRegistry: ParameterTypeRegistry;
  stepDefinitions: StepDefinition[] = [];

  defineStep<A extends unknown[], C>(pattern: DefineStepPattern, code: StepDefinitionCode<A, C>) {
    if (pattern instanceof RegExp) {
    } else {
      let cucumberExpression = new CucumberExpression(pattern, this.cucumberExpressionParamRegistry);
    }

    defineCucumberStep()
  }

  constructor() {
    this.cucumberExpressionParamRegistry = new ParameterTypeRegistry();
  }
}
