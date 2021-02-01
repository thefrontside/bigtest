import { requireDefaultTextExport } from './rules/require-default-export';

export const rules = {
  '@bigtest/require-default-export': requireDefaultTextExport
};

export const configs = {
  root: true,
  recommended: {
    rules: {
      '@bigtest/require-default-export': 2
    }
  }
}