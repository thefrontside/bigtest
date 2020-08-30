import { requireDefaultTextExport } from './rules/require-default-test-export';
export * from './types';

export const rules = {
  'require-default-test-export': requireDefaultTextExport
};

export const configs = {
  root: true,
  recommended: {
    rules: {
      'bigtest/require-default-test-export': 2
    }
  }
}