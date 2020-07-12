import { ParameterTypeRegistry, CucumberExpression, RegularExpression } from 'cucumber-expressions';
import { assert } from '../util/assert';
import { DefineStepOptions, StepCode, DefineStep, StepDefinitionPattern, StepDefinition } from '../types/steps';
import { IdGenerator, messages } from 'cucumber-messages';
import { Step } from '@bigtest/suite';

const { uuid } = IdGenerator;

interface Registry {
  defineStep: DefineStep;
}

export const isStepCode = <A extends unknown[]>(c: DefineStepOptions | StepCode<A>): c is StepCode<A> =>
  c !== undefined && typeof c === 'function';

// TODO: Add support for data tables
// TODO: Add a similar class HookRegistry
// TODO: Add support for custom custom ParameterTypeRegistry
export class StepRegistry implements Registry {
  parameterTypeRegistry: ParameterTypeRegistry;
  stepDefinitions: StepDefinition<unknown[]>[] = [];
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

  // TODO: tie step to feature file.  We don't want to run the wrong steps on the wrong feature files
  defineStep<A extends unknown[], R>(pattern: string | RegExp, code: StepCode<A>): void;
  defineStep<A extends unknown[]>(pattern: string | RegExp, options: DefineStepOptions, code: StepCode<A>): void;
  defineStep<A extends unknown[], R>(
    pattern: string | RegExp,
    optionsOrCode: DefineStepOptions | StepCode<A>,
    code?: StepCode<A>,
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

    // TODO: need to get line numbers etc. of code for good error reporting
    this.stepDefinitions.push({
      code: wrapped as StepCode<unknown[]>,
      expression,
      options,
    });
  }

  // TODO: should include the feature name in the filter?
  resolveAndTransformStepDefinition({ text }: messages.Pickle.IPickleStep): Step | undefined {
    assert(!!text, 'no text in pickleStep');

    let stepAndArgs = this.stepDefinitions.flatMap(stepDefinition => {
      let args = stepDefinition.expression.match(text);

      if (args === undefined) {
        return [];
      }

      return [{ stepDefinition, args }];
    });

    if (stepAndArgs.length === 0) {
      return;
    }

    let {
      stepDefinition: { code },
      args,
    } = stepAndArgs[0]; // TODO: what if there is more than 1 match?

    let step: Step = {
      description: text,
      action: () => code(...(args ?? [])),
    };

    return step;
  }
}

export const stepRegistry = new StepRegistry();
