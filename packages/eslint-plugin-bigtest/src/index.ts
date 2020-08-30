import { requireDefaultTextExport } from './rules/require-default-test-export';
export * from './types';

export const rules = {
  'bigtest/require-default-test-export': requireDefaultTextExport
};

export const configs = {
  rules
}

console.error(configs)