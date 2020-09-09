import { TSESLint } from '@typescript-eslint/experimental-utils';
import { requireDefaultTextExport } from '../src/rules/require-default-export';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

ruleTester.run('require-default-export', requireDefaultTextExport, {
  valid: [
`
import { test } from '@bigtest/suite';

const delay = (time = 50) =>
  async () => { await new Promise(resolve => setTimeout(resolve, time)) };

export default test('Failing Test')
  .step("first step", delay())
  .assertion("check the thing", delay(3))`
,
`
export default {
  description: "Signing In",
  steps: [
    {
      description: "given a user",
      action: async (context) => ({ ...context, user: { username: "cowboyd" } })
    },
  ],
  assertions: [
    {
      description: "then I am logged in",
      check: async () => true
    },
  ]
}
`,
`
module.exports = {
  description: "An empty test with no steps and no children",
  steps: [],
  assertions: [],
  children: []
}
`
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
  ],
});  