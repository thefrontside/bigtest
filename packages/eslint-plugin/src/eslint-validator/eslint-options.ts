import { ESLint } from 'eslint';

export const EslintOptions: ESLint.Options = {
  useEslintrc: false,
  allowInlineConfig: true,
  overrideConfig: {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 9,
    },
  },
  baseConfig: {
    root: true,
    plugins: ['@bigtest'],
    rules: {
      '@bigtest/require-default-export': 'error',
    },
  },
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
};
