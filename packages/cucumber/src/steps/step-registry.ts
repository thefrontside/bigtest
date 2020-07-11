/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  StepDefinition,
  defineStep as defineCucumberStep,
  StepDefinitionCode,
  setDefinitionFunctionWrapper,
} from 'cucumber';
import { ParameterTypeRegistry } from 'cucumber-expressions';

export type StepCode<A extends any[], R> = (...args: A) => R;

export type StepDefinitionPattern = string | RegExp;

export type DefineStep = <A extends any[], R>(pattern: StepDefinitionPattern, code: StepCode<A, R>) => void;

interface Registry {
  defineStep: DefineStep;
}

const cacheFunctionWrapper = <A extends any[], R>(fn: (...args: A) => R) => (_: string, ...args: A) => fn(...args);

export class StepRegistry implements Registry {
  parameterTypeRegistry: ParameterTypeRegistry;
  stepDefinitions: StepDefinition[] = [];
  methods: {
    Given: DefineStep;
    When: DefineStep;
    Then: DefineStep;
    And: DefineStep;
  };

  constructor() {
    this.parameterTypeRegistry = new ParameterTypeRegistry();
    let defineStep = this.defineStep.bind(this);

    this.methods = {
      Given: defineStep,
      When: defineStep,
      Then: defineStep,
      And: defineStep,
    };
  }

  defineStep<A extends any[], R>(pattern: StepDefinitionPattern, code: StepCode<A, R>) {
    let wrapped = (...args: A) => {
      console.log(args);

      return code(...args);
    };

    defineCucumberStep(pattern, wrapped as StepDefinitionCode);
  }
}

export const stepRegistry = new StepRegistry();
