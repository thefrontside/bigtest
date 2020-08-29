import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../src/rules/require-default-test-export';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

ruleTester.run('require-default-export', rule, {
  valid: [`
import { test } from '@bigtest/suite';

const delay = (time = 50) =>
  async () => { await new Promise(resolve => setTimeout(resolve, time)) };

export default test('Failing Test')
  .step("first step", delay())
  .assertion("check the thing", delay(3))`
  ],
  invalid: [
    {
      code: `
import { test } from '@bigtest/suite';

const delay = (time = 50) =>
  async () => { await new Promise(resolve => setTimeout(resolve, time)) };

export const NoDefaultExportTest = test('Failing Test')
  .step("first step", delay());
      `,
      parserOptions: { sourceType: 'module' },
      errors: [{ messageId: 'namedExport' }],
    },
//     {
//       code: `
// function test() {}

// export default test();
// `,
//       parserOptions: { sourceType: 'module' },
//       errors: [{ endColumn: 29, column: 1, messageId: 'noDefaultExport' }],
//     },
  ],
});  