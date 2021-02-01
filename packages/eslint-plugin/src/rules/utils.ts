import {
  ESLintUtils,
} from '@typescript-eslint/experimental-utils';
import path from 'path';
import { execSync } from 'child_process';

const REPO_URL = 'https://github.com/thefrontside/bigtest';

export const getCurrentBranch = (): string => {
  try {
    return execSync('git branch --show-current', { timeout: 1000 }).toString().trim();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export const createRule = ESLintUtils.RuleCreator(name => {
  let ruleName = path.parse(name).name;

  let currentBranch = getCurrentBranch();

  return `${REPO_URL}/blob/${currentBranch}/packages/eslint-plugin/docs/rules/${ruleName}.md`;
});
