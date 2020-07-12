import { ParameterTypeRegistry, CucumberExpression, RegularExpression } from 'cucumber-expressions';
import { assert } from '../util/assert';
import { DefineStepOptions, StepCode, DefineStep, StepDefinitionPattern, StepDefinition } from '../types/steps';
import { IdGenerator, messages } from 'cucumber-messages';
import { Step, Context } from '@bigtest/suite';

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
  defineStep<A extends unknown[]>(pattern: string | RegExp, code: StepCode<A>): void;
  defineStep<A extends unknown[]>(pattern: string | RegExp, options: DefineStepOptions, code: StepCode<A>): void;
  defineStep<A extends unknown[]>(
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

    // TODO: need to get line numbers etc. of code for good error reporting
    this.stepDefinitions.push({
      code: block as StepCode<unknown[]>,
      expression,
      options,
    });
  }

  // TODO: should include the feature name in the filter
  // could potentially have more than one match
  resolveAndTransformStepDefinition({ text }: messages.Pickle.IPickleStep): Step | undefined {
    assert(!!text, 'no text in pickleStep');

    let stepAndArgs = this.stepDefinitions.flatMap(stepDefinition => {
      let args = stepDefinition.expression.match(text)?.map(match => match.getValue({}));

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      action: (ctx: Context = {}): any => {
        let funcArgs = args ?? [];
        console.log(args);

        // TODO: need better logic like a symbol to identify
        // that the last argument is the context or not
        if (typeof funcArgs.slice(-1)[0] !== 'object') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          funcArgs.push(ctx as any);
        }

        console.log(code.toString());

        return code(...funcArgs);
      },
    };

    return step;
  }
}

export const stepRegistry = new StepRegistry();
