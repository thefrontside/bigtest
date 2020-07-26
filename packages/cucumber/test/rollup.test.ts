import { describe, it } from 'mocha';
import expect from 'expect';
import { rollup } from 'rollup';
import { cucumberRollupPlugin } from '../src/rollup/rollup-bigtest-cucumber-plugin';
import path from 'path';

// Is there something more modern with types?
// eslint-disable-next-line @typescript-eslint/no-var-requires
const hypothetical = require('rollup-plugin-hypothetical');

describe('bigtest cucumber rollup plugin', () => {
  it('should compile Gherkin code correctly', async () => {
    let bundle = await rollup({
      input: './test/gherkin.feature',
      plugins: [
        hypothetical({
          files: {
            './test/gherkin.feature': `Feature: calculator
          Scenario: adding some numbers
            Given I take the number 5
            When I add the number 3
            And I add another number 34
            Then I will have 42`,
          },
        }),
        cucumberRollupPlugin({ cwd: path.join(process.cwd(), 'features') }),
      ],
    });

    let result = await bundle.generate({ format: 'commonjs', sourcemap: true });

    console.log(result);

    expect(result).not.toBeFalsy();
  });
});
