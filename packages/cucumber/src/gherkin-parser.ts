import gherkin from 'gherkin';
import { messages } from 'cucumber-messages';
import { Readable } from 'stream';
// import { test } from '@bigtest/suite';
import { executeSteps } from './compilers/tsc';
import { ParameterTypeRegistry } from 'cucumber-expressions';
import { StepDefinition } from 'cucumber';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { supportCodeLibraryBuilder } = require('cucumber');

export class GherkinParser {
  featureFiles: string[] = [];
  stepFiles: string[] = [];
  stepDefinitions: StepDefinition[] = [];

  constructor(sources: string[]) {
    this.featureFiles = sources.filter(source => source.endsWith('.feature'));
    // TODO: add support for js files
    this.stepFiles = sources.filter(source => source.endsWith('.ts'));
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

    supportCodeLibraryBuilder.options.parameterTypeRegistry = new ParameterTypeRegistry();
    let finalizedStepDefinitions = supportCodeLibraryBuilder.finalize();
    console.dir(finalizedStepDefinitions, { depth: null });
    this.stepDefinitions = finalizedStepDefinitions.stepDefinitions;
  }

  async getFiles() {
    await this.loadStepDefinitions();

    await Promise.all(
      this.featureFiles.map(async featureFile => {
        let result = await this.streamToArray(gherkin.fromPaths([featureFile]));

        let { gherkinDocument } = result[1];

        if (!gherkinDocument?.feature) {
          // TODO: proper error message with line number etc.
          throw new Error('cannot parse document');
        }

        result.forEach(({ pickle: scenario }) => {
          if (!scenario) {
            return;
          }

          console.log(scenario);
          // let description = scenario.name;
        });
      }),
    );

    // console.log(JSON.stringify(specs));
  }
}
