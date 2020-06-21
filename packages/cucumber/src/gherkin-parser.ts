import gherkin from 'gherkin';
import { messages } from 'cucumber-messages';
import { Readable } from 'stream';
import { test as testBuilder, TestBuilder } from '@bigtest/suite';
import { executeSteps } from './compilers/compileToString';
import { CucumberExpression, ParameterTypeRegistry } from 'cucumber-expressions';
import { StepDefinition } from 'cucumber';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { supportCodeLibraryBuilder } = require('cucumber');

export class GherkinParser {
  featureFiles: string[] = [];
  stepFiles: string[] = [];
  stepDefinitions: StepDefinition[] = [];
  cucumberExpressionParamRegistry: ParameterTypeRegistry;

  constructor(sources: string[]) {
    this.featureFiles = sources.filter(source => source.endsWith('.feature'));
    // TODO: add support for js files
    this.stepFiles = sources.filter(source => source.endsWith('.ts'));
    this.cucumberExpressionParamRegistry = new ParameterTypeRegistry();
  }

  private streamToArray(readableStream: Readable): Promise<messages.IEnvelope[]> {
    return new Promise((resolve, reject) => {
      let items: messages.IEnvelope[] = [];
      readableStream.on('data', items.push.bind(items));
      readableStream.on('error', reject);
      readableStream.on('end', () => resolve(items));
    });
  }

  async loadStepDefinitions() {
    supportCodeLibraryBuilder.reset(process.cwd());

    await executeSteps(this.stepFiles);

    supportCodeLibraryBuilder.options.parameterTypeRegistry = this.cucumberExpressionParamRegistry;
    let finalizedStepDefinitions = supportCodeLibraryBuilder.finalize();
    this.stepDefinitions = finalizedStepDefinitions.stepDefinitions;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shouldRun(stepDefinition: StepDefinition, step: messages.Pickle.IPickleStep) {
    if (!step.text) {
      throw new Error('No text in step');
    }

    if (typeof stepDefinition.pattern === 'string') {
      let cucumberExpression = new CucumberExpression(stepDefinition.pattern, this.cucumberExpressionParamRegistry);

      let matchResult = cucumberExpression.match(step.text);

      return matchResult ? matchResult.map(r => r.getValue(step)) : undefined;
    } else if (stepDefinition.pattern instanceof RegExp) {
      let match = stepDefinition.pattern.exec(step.text);

      return match ? match.slice(1) : undefined;
    }

    throw new Error(
      `Step implementation invalid. Has to be a string or RegExp. Received ${typeof stepDefinition.pattern}`,
    );
  }

  runStepDefinition(testBuilder: TestBuilder<Record<string, unknown>>, step: messages.Pickle.IPickleStep) {
    for (let stepDefinition of this.stepDefinitions) {
      let args = this.shouldRun(stepDefinition, step);

      if (!args) {
        continue;
      }

      let code = stepDefinition.code;

      testBuilder.step(step.text as string, code.bind(code, ...args));
    }
  }

  async compileFeatures() {
    await this.loadStepDefinitions();

    return await Promise.all(
      this.featureFiles.map(async featureFile => {
        let result = await this.streamToArray(gherkin.fromPaths([featureFile]));

        let { gherkinDocument } = result[1];

        if (!gherkinDocument?.feature) {
          // TODO: proper error message with line number etc.
          throw new Error('cannot parse document');
        }

        for (let { pickle: scenario } of result) {
          if (!scenario?.steps) {
            continue;
          }

          let test = testBuilder(`scenario: ${scenario.name}`);

          try {
            for (let step of scenario.steps) {
              this.runStepDefinition(test, step);
            }
          } catch (err) {
            console.error(err);
            throw err;
          }

          return test;
        }
      }),
    );
  }
}
