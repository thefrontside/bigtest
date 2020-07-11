import { ParameterTypeRegistry, CucumberExpression, RegularExpression } from 'cucumber-expressions';
import { assert } from '../util/assert';
import { DefineStepOptions, StepCode, DefineStep, StepDefinitionPattern, StepDefinition } from '../types/steps';
import { IdGenerator } from 'cucumber-messages';

const { uuid } = IdGenerator;

interface Registry {
  defineStep: DefineStep;
}

export const isStepCode = <A extends unknown[], R>(c: DefineStepOptions | StepCode<A, R>): c is StepCode<A, R> =>
  c !== undefined && typeof c === 'function';

export class StepRegistry implements Registry {
  parameterTypeRegistry: ParameterTypeRegistry;
  stepDefinitions: StepDefinition<unknown[], unknown>[] = [];
  newId: IdGenerator.NewId;
  cwd: string;

  methods: {
    Given: DefineStep;
    When: DefineStep;
    Then: DefineStep;
    And: DefineStep;
  };

  constructor() {
    this.parameterTypeRegistry = new ParameterTypeRegistry();
    let defineStep = this.defineStep.bind(this);
    this.cwd = process.cwd();
    this.newId = uuid();

    this.methods = {
      Given: defineStep,
      When: defineStep,
      Then: defineStep,
      And: defineStep,
    };
  }

  reset(cwd: string, newId: IdGenerator.NewId): void {
    this.cwd = cwd;
    this.newId = newId;
    this.stepDefinitions = [];
  }

  defineStep<A extends unknown[], R>(pattern: string | RegExp, code: StepCode<A, R>): void;
  defineStep<A extends unknown[], R>(pattern: string | RegExp, options: DefineStepOptions, code: StepCode<A, R>): void;
  defineStep<A extends unknown[], R>(
    pattern: string | RegExp,
    optionsOrCode: DefineStepOptions | StepCode<A, R>,
    code?: StepCode<A, R>,
  ): void {
    let block = isStepCode(optionsOrCode) ? optionsOrCode : code;
    let options: DefineStepOptions = typeof optionsOrCode === 'object' ? optionsOrCode : {};

    let expression: StepDefinitionPattern =
      typeof pattern === 'string'
        ? new CucumberExpression(pattern, this.parameterTypeRegistry)
        : new RegularExpression(pattern, this.parameterTypeRegistry);

    let wrapped = (...args: A) => {
      assert(typeof block !== 'undefined', 'no code in step definition');
      console.log(args);

      return block(...args);
    };

    this.stepDefinitions.push({
      code: wrapped as StepCode<unknown[], unknown>,
      expression,
      options,
    });
  }
}

export const stepRegistry = new StepRegistry();
