import { Parser, AstBuilder, compile } from '@cucumber/gherkin';
import { messages } from 'cucumber-messages';
import { test as testBuilder, TestImplementation, Check } from '@bigtest/suite';
import { assert } from './util/assert';
import { Compiler } from './compilers/compiler';
import { runCode } from './compilers/run-code';
import { stepRegistry } from './steps/step-registry';
import { IdGenerator } from 'cucumber-messages';
import { StepDefinitionType } from './types/steps';
import { glob } from './promisified';

export class GherkinParser {
  stepFiles: string[] = [];
  code: string;
  rootDir: string;
  parser: Parser;
  uri: string;
  id: IdGenerator.NewId;

  constructor({ code, uri, rootDir }: { code: string; uri: string; rootDir: string }) {
    this.code = code;
    this.rootDir = rootDir;
    this.uri = uri;
    // TODO: should this id come from bigtest?
    this.id = IdGenerator.incrementing();
    this.parser = new Parser(new AstBuilder(this.id));
  }

  async getStepFiles() {
    // TODO: add support for js files
    let sources = await glob(`${this.rootDir}/**/*.{ts,js}`);

    this.stepFiles = sources.filter(source => source.endsWith('.ts'));
  }

  createTestImplementationFromFeature(gherkinDocument: messages.IGherkinDocument): TestImplementation {
    let feature = gherkinDocument.feature;

    assert(!!feature?.name, 'No feature name');

    return testBuilder(`feature: ${feature.name}`);
  }

  createTestsFromFeature(pickle: messages.IPickle): TestImplementation | undefined {
    if (!pickle.steps?.length) {
      return;
    }

    assert(!!pickle?.name, 'No pickle name');

    let child = testBuilder(`scenario: ${pickle.name}`);

    for (let pickleStep of pickle.steps) {
      let stepDefinition = stepRegistry.resolveAndTransformStepDefinition(pickleStep);

      if (stepDefinition === undefined) {
        continue;
      }

      let { type, ...step } = stepDefinition;

      if (type === StepDefinitionType.Step) {
        child.steps.push(step);
      } else {
        child.assertions.push({ description: step.description, check: step.action as Check });
      }
    }

    return child;
  }

  async parse(): Promise<TestImplementation[]> {
    let tests: TestImplementation[] = [];

    let document = this.parser.parse(this.code);

    let pickles = compile(document, this.uri, this.id);

    assert(pickles.length, 'no pickles in gherkin document.');

    await this.loadStepDefinitions();

    let test = this.createTestImplementationFromFeature(document);

    test.children = pickles.map(this.createTestsFromFeature).filter((c: unknown): c is TestImplementation => !!c);

    tests.push(test);

    return tests;
  }

  async loadStepDefinitions() {
    // should test id be coming from uuid
    stepRegistry.reset(this.rootDir, this.id);

    await this.getStepFiles();

    let compiler = new Compiler();

    let precompiled = await compiler.precompile(this.stepFiles);

    for (let { code, fileName } of precompiled) {
      runCode(code, fileName);
    }
  }
}
