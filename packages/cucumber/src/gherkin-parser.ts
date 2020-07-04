import gherkin from 'gherkin';
import { messages } from 'cucumber-messages';
import { Readable } from 'stream';
import { test as testBuilder, TestImplementation, Step } from '@bigtest/suite';
import { CucumberExpression, ParameterTypeRegistry } from 'cucumber-expressions';
import { StepDefinition } from 'cucumber';
import { assert } from './util/assert';
import { notNothing } from './util/guards/guards';
import { Compiler } from './compilers/compiler';

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

    let compiler = new Compiler();

    let precompiled = await compiler.precompile(this.stepFiles);

    console.dir(precompiled, { depth: 33 });

    supportCodeLibraryBuilder.options.parameterTypeRegistry = this.cucumberExpressionParamRegistry;
    let finalizedStepDefinitions = supportCodeLibraryBuilder.finalize();
    this.stepDefinitions = finalizedStepDefinitions.stepDefinitions;
  }

  shoudRunStepDefinition(stepDefinition: StepDefinition, pickleStep: messages.Pickle.IPickleStep) {
    assert(!!pickleStep.text, 'No text in step');

    if (typeof stepDefinition.pattern === 'string') {
      let cucumberExpression = new CucumberExpression(stepDefinition.pattern, this.cucumberExpressionParamRegistry);

      let matchResult = cucumberExpression.match(pickleStep.text);

      return matchResult ? matchResult.map(r => r.getValue(pickleStep)) : undefined;
    } else if (stepDefinition.pattern instanceof RegExp) {
      let match = stepDefinition.pattern.exec(pickleStep.text);

      return match ? match.slice(1) : undefined;
    }

    throw new Error(
      `Step implementation invalid. Has to be a string or RegExp. Received ${typeof stepDefinition.pattern}`,
    );
  }

  resolveStepDefinition(currentStepDefinition: messages.Pickle.IPickleStep): Step | undefined {
    for (let stepDefinition of this.stepDefinitions) {
      let args = this.shoudRunStepDefinition(stepDefinition, currentStepDefinition);

      if (!args) {
        continue;
      }

      assert(currentStepDefinition.text, 'no text in stepDefinition');
      // let code = stepDefinition.code;

      console.log('-----------------------');
      console.dir(args, { depth: 33 });
      console.log(stepDefinition.code.toString());
      console.log('-----------------------');

      let step: Step = {
        description: currentStepDefinition.text,
        action: async c => c,
      };

      return step;
      // const step: Step = {
      //   description: stepDefinition.
      // }

      // testBuilder.step(step.text as string, code.bind(code, ...args));
    }
  }

  async compileFeatures(): Promise<TestImplementation[]> {
    await this.loadStepDefinitions();

    let candidates = await Promise.all(
      this.featureFiles.map(featureFile => {
        return this.streamToArray(gherkin.fromPaths([featureFile]));
      }),
    );

    return candidates.flatMap(e => {
      let gherkinFeature = e[1]?.gherkinDocument?.feature;

      assert(!!gherkinFeature?.name, 'No feature name');

      let feature = testBuilder(`feature: ${gherkinFeature.name}`);

      feature.children = e
        .flatMap(el => (notNothing(el.pickle) ? [el.pickle] : []))
        .flatMap(pickle => {
          let scenario = testBuilder(`scenario: ${pickle.name}`);

          scenario.steps =
            pickle.steps?.flatMap(stepDefinition => {
              let step = this.resolveStepDefinition(stepDefinition);

              return notNothing(step) ? [step] : [];
            }) ?? [];

          return scenario.steps.length > 0 ? [scenario] : [];
        });

      return feature.children.length > 0 ? [feature] : [];
    });
  }
}
