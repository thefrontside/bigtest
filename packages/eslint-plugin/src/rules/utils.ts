import {
  ESLintUtils,
} from '@typescript-eslint/experimental-utils';
import path from 'path';

const REPO_URL = 'https://github.com/thefrontside/bigtest';

export const createRule = ESLintUtils.RuleCreator(name => {
  let ruleName = path.parse(name).name;

  // TODO: can we get the v0 programmatically?
  // there is no sane way to get the base branch in git
  return `${REPO_URL}/blob/v0/packages/eslint-plugin/docs/rules/${ruleName}.md`;
});
