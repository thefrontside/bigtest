import {
  ESLintUtils,
} from '@typescript-eslint/experimental-utils';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../../package.json');

const REPO_URL = 'https://github.com/thefrontside/bigtest/eslint-plugin';

export const createRule = ESLintUtils.RuleCreator(name => {
  let ruleName = path.parse(name).name;

  return `${REPO_URL}/blob/v${version}/docs/rules/${ruleName}.md`;
});
