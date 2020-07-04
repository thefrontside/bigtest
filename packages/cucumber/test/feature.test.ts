import { describe, it } from 'mocha';
import expect from 'expect';
import path from 'path';
import glob from 'glob';
import { GherkinParser } from '../src/gherkin-parser';

const sourcesPath = path.join(process.cwd(), 'features');
let sources = glob.sync(`${sourcesPath}/**/*.{ts,js,feature}`);

describe('feature parser', () => {
  it('should find feature files and step definitions', () => {
    let cucumber = new GherkinParser(sources);

    expect(cucumber.featureFiles).toHaveLength(1);
    expect(cucumber.stepFiles).toHaveLength(1);
  });

  it('should transform feature files in tests', async () => {
    let cucumber = new GherkinParser(sources);

    let tests = await cucumber.compileFeatures();

    tests
      .flatMap(t => t.children.flatMap(t => t.steps))
      .forEach(t => {
        (t as any).action();
      });

    expect(tests).toHaveLength(1);
  });
});
