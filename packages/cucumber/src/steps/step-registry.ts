import { ParameterTypeRegistry, CucumberExpression, RegularExpression } from 'cucumber-expressions';
import { assert } from '../util/assert';
import {
  DefineStep,
  StepDefinitionPattern,
  StepDefinition,
  StepDefinitionType,
  StepOrAssertion,
  StepCode,
  AssertionCode,
  DefineAssertion,
} from '../types/steps';
import { IdGenerator, messages } from 'cucumber-messages';
import { Context } from '@bigtest/suite';
import { isPromise } from '../util/guards/guards';

const { uuid } = IdGenerator;

// TODO: Add support for data tables
// TODO: Add a similar class HookRegistry
// TODO: Add support for custom custom ParameterTypeRegistry
export class StepRegistry {
  parameterTypeRegistry: ParameterTypeRegistry;
  stepDefinitions: StepDefinition<unknown[], Context>[] = [];
  newId: IdGenerator.NewId;
  cwd: string;

  methods: {
    Given: DefineStep;
    When: DefineStep;
    And: DefineStep;
    Then: DefineAssertion;
  };

  constructor() {
    this.parameterTypeRegistry = new ParameterTypeRegistry();
    let defineStep = this.defineStep.bind(this);
    let defineAssertion = this.defineAssertion.bind(this);
    this.cwd = process.cwd();
    this.newId = uuid();

    this.methods = {
      Given: defineStep,
      When: defineStep,
      And: defineStep,
      Then: defineAssertion,
    };
  }

  reset(cwd: string, newId: IdGenerator.NewId): void {
    this.cwd = cwd;
    this.newId = newId;
    this.stepDefinitions = [];
  }

  define<A extends unknown[], R extends Context>(
    pattern: string | RegExp,
    code: StepCode<A, R> | AssertionCode<A>,
    stepType: StepDefinitionType = StepDefinitionType.Step,
  ): void {
    let expression: StepDefinitionPattern =
      typeof pattern === 'string'
        ? new CucumberExpression(pattern, this.parameterTypeRegistry)
        : new RegularExpression(pattern, this.parameterTypeRegistry);

    // TODO: need to get line numbers to distinguish step
    this.stepDefinitions.push({
      code: code as StepCode<unknown[], R>,
      expression,
      type: stepType,
    });
  }

  defineStep<A extends unknown[], R extends Context>(pattern: string | RegExp, code: StepCode<A, R>): void {
    this.define(pattern, code, StepDefinitionType.Step);
  }

  defineAssertion<A extends unknown[]>(pattern: string | RegExp, code: AssertionCode<A>): void {
    this.define(pattern, code, StepDefinitionType.Step);
  }

  resolveStepDefinitionAndArguments(text: string) {
    let potentialStepAndArgs = this.stepDefinitions.flatMap(stepDefinition => {
      let args = stepDefinition.expression.match(text)?.map(match => match.getValue({}));

      if (args === undefined) {
        return [];
      }

      return [{ stepDefinition, args }];
    });

    if (potentialStepAndArgs.length === 0) {
      return;
    }

    // TODO: need someway to distinguish more than 1 identical step
    assert(potentialStepAndArgs.length === 1, 'More than 1 identical feature step text');

    return potentialStepAndArgs;
  }

  resolveAndTransformStepDefinition({ text }: messages.Pickle.IPickleStep): StepOrAssertion | undefined {
    assert(!!text, 'no text in pickleStep');

    let stepAndArgs = this.resolveStepDefinitionAndArguments(text);

    if (!stepAndArgs) {
      return;
    }

    // TODO: need someway to distinguish more than 1 identical step
    assert(stepAndArgs.length === 1, 'More than 1 identical feature step text');

    let {
      stepDefinition: { code, type },
      args,
    } = stepAndArgs[0];

    let action = async (ctx: Context = {}) => {
      let funcArgs = args ?? [];

      // TODO: need better logic like a symbol to identify
      // that the last argument is the context or not
      if (typeof funcArgs.slice(-1)[0] === 'object') {
        funcArgs[funcArgs.length - 1] = ctx;
      } else {
        funcArgs.push(ctx);
      }

      if (isPromise(code)) {
        return await code(...funcArgs);
      }

      return code(...funcArgs);
    };

    return {
      description: text,
      action,
      type,
    };
  }
}

export const stepRegistry = new StepRegistry();
