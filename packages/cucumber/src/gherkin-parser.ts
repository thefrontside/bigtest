import gherkin from 'gherkin';
import { messages } from 'cucumber-messages';
import { Readable } from 'stream';
import { test as testBuilder, TestImplementation } from '@bigtest/suite';
import { assert } from './util/assert';
import { notNothing } from './util/guards/guards';
import { Compiler } from './compilers/compiler';
import { runCode } from './compilers/run-code';
import { stepRegistry } from './steps/step-registry';
import { IdGenerator } from 'cucumber-messages';

const { uuid } = IdGenerator;

export class GherkinParser {
  featureFiles: string[] = [];
  stepFiles: string[] = [];

  constructor(sources: string[]) {
    this.featureFiles = sources.filter(source => source.endsWith('.feature'));
    // TODO: add support for js files
    this.stepFiles = sources.filter(source => source.endsWith('.ts'));
  }

  createTestFromFeature(gherkinDocument: messages.IGherkinDocument): TestImplementation {
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
      pickle.steps.flatMap(pickleStep => {
        let step = stepRegistry.resolveAndTransformStepDefinition(pickleStep);

        return notNothing(step) ? [step] : [];
      }) ?? [];

    test.children.push(child);
  }

  private parseFeatures(readableStream: Readable): Promise<TestImplementation[]> {
    let tests: TestImplementation[] = [];

    return new Promise((resolve, reject) => {
      readableStream.on('data', (envelope: messages.IEnvelope) => {
        if (envelope?.gherkinDocument) {
          tests.push(this.createTestFromFeature(envelope.gherkinDocument));
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
    // should test id be coming from uuid
    stepRegistry.reset(process.cwd(), uuid());

    let compiler = new Compiler();

    let precompiled = await compiler.precompile(this.stepFiles);

    for (let { code, fileName } of precompiled) {
      runCode(code, fileName);
    }
  }

  async compileFeatures(): Promise<TestImplementation[]> {
    await this.loadStepDefinitions();

    return await this.parseFeatures(gherkin.fromPaths(this.featureFiles));
  }
}
