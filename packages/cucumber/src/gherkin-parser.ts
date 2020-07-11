import gherkin from 'gherkin';
import { messages } from 'cucumber-messages';
import { Readable } from 'stream';
import { test as testBuilder, TestImplementation, Step } from '@bigtest/suite';
import { CucumberExpression, ParameterTypeRegistry } from 'cucumber-expressions';
import { StepDefinition } from 'cucumber';
import { assert } from './util/assert';
import { notNothing } from './util/guards/guards';
import { Compiler } from './compilers/compiler';
import { runCode } from './compilers/run-code';

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

  newTestFromFeature(gherkinDocument: messages.IGherkinDocument): TestImplementation {
    let feature = gherkinDocument.feature;

    assert(!!feature?.name, 'No feature name');

    return testBuilder(`feature: ${feature.name}`);
  }

  addScenario(pickle: messages.IPickle, tests: TestImplementation[]) {
    if (!pickle.steps?.length) {
      return;
    }

    assert(!!pickle?.name, 'No pickle name');

    let test = tests[tests.length - 1];

    let child = testBuilder(`scenario: ${pickle.name}`);

    child.steps =
      pickle.steps.flatMap(stepDefinition => {
        let step = this.resolveStepDefinition(stepDefinition);

        return notNothing(step) ? [step] : [];
      }) ?? [];

    test.children.push(child);
  }

  private parseFeatures(readableStream: Readable): Promise<TestImplementation[]> {
    let tests: TestImplementation[] = [];

    return new Promise((resolve, reject) => {
      readableStream.on('data', (envelope: messages.IEnvelope) => {
        if (envelope?.gherkinDocument) {
          tests.push(this.newTestFromFeature(envelope.gherkinDocument));

          return;
        }

        if (envelope?.pickle) {
          this.addScenario(envelope.pickle, tests);
        }
      });
      readableStream.on('error', reject);
      readableStream.on('end', () => resolve(tests));
    });
  }

  async loadStepDefinitions() {
    supportCodeLibraryBuilder.reset(process.cwd());

    let compiler = new Compiler();

    let precompiled = await compiler.precompile(this.stepFiles);

    for (let { code, fileName } of precompiled) {
      runCode(code, fileName);
    }

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

      let { code } = stepDefinition;

      let step: Step = {
        description: currentStepDefinition.text,
        action: () => code(...(args ?? [])),
      };

      return step;
    }
  }

  async compileFeatures(): Promise<TestImplementation[]> {
    await this.loadStepDefinitions();

    return await this.parseFeatures(gherkin.fromPaths(this.featureFiles));
  }
}
