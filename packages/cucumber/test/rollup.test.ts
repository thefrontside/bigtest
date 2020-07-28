import { describe, it } from 'mocha';
import expect from 'expect';
import { rollup } from 'rollup';
import { cucumberRollupPlugin } from '../src/rollup/rollup-cucumber-plugin';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const hypothetical = require('rollup-plugin-hypothetical');

const cwd = process.cwd();

const featuresDir = path.join(cwd, 'features');

describe('bigtest cucumber rollup plugin', () => {
  it('should compile Gherkin with entry point', async () => {
    let bundle = await rollup({
      input: './features/calculator.feature',
      plugins: [
        hypothetical({
          files: {
            './features/calculator.feature': `Feature: calculator
          Scenario: adding some numbers
            Given I take the number 5
            When I add the number 3
            And I add another number 34
            Then I will have 42`,
          },
        }),
        cucumberRollupPlugin({ cwd: featuresDir }),
      ],
    });

    let result = await bundle.generate({ format: 'esm', sourcemap: true });

    expect(result).not.toBeFalsy();
  });

  it('should compile Gherkin code without an entry point', async () => {
    let bundle = await rollup({
      plugins: [cucumberRollupPlugin({ cwd: featuresDir })],
    });

    let result = await bundle.generate({ format: 'esm', sourcemap: true });

    expect(result).not.toBeFalsy();
  });
});
