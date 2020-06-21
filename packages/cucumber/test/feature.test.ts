import { describe, it } from 'mocha';
import expect from 'expect';
import path from 'path';
import glob from 'glob';
import { GherkinParser } from '../src/gherkin-parser';

const sourcesPath = path.join(process.cwd(), 'features');
let sources = glob.sync(`${sourcesPath}/**/*.{ts,js,feature}`);

describe('feature parser', () => {
  it('should find features and steps', () => {
    let cucumber = new GherkinParser(sources);

    expect(cucumber.featureFiles).toHaveLength(1);
    expect(cucumber.stepFiles).toHaveLength(1);
  });

  it('should transform feature files', async () => {
    let cucumber = new GherkinParser(sources);

    await cucumber.getFiles();
  });
});
