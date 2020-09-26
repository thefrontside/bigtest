import { requireDefaultTextExport } from './rules/require-default-export';

export const rules = {
  'require-default-export': requireDefaultTextExport
};

export const configs = {
  root: true,
  recommended: {
    rules: {
      'bigtest/require-default-export': 2
    }
  }
}

export { EslintValidator, EslintValidatorOptions } from './eslint-validator/eslint-validator';
export { rollupEslintPlugin as eslint } from './rollup-plugin-eslint/rollup-plugin-eslint';

export type { Validator, ValidationError, ValidationWarning, ValidationState } from './types';