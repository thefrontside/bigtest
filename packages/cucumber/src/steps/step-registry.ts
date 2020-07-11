import { StepDefinition, defineStep as defineCucumberStep, StepDefinitionCode } from 'cucumber';
import { ParameterTypeRegistry } from 'cucumber-expressions';
import { Fn } from 'src/types/common';

export type StepCode<F extends Fn> = (...args: Parameters<F>) => ReturnType<F>;

export type StepDefinitionPattern = string | RegExp;

export type DefineStep = <C extends Fn>(pattern: StepDefinitionPattern, code: StepCode<C>) => void;

interface Registry {
  defineStep: DefineStep;
}

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

  defineStep<C extends Fn>(pattern: StepDefinitionPattern, code: StepCode<C>) {
    defineCucumberStep(pattern, code as StepDefinitionCode);
  }
}
