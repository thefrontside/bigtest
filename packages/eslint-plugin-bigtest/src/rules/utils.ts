import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { BigtestFunctionCallExpression, BigtestTopLevelFunctionName, BigtestToplevelName } from '../types'
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../../package.json');

const REPO_URL = 'https://github.com/thefrontside/bigtest/eslint-plugin-plugin';

export const createRule = ESLintUtils.RuleCreator(name => {
  let ruleName = path.parse(name).name;

  return `${REPO_URL}/blob/v${version}/docs/rules/${ruleName}.md`;
});

export const isTopLevelTest = (
  node: TSESTree.CallExpression,
): node is BigtestFunctionCallExpression<BigtestTopLevelFunctionName> => {
  return node.callee.type === AST_NODE_TYPES.MemberExpression 
    && node.callee.property.type === AST_NODE_TYPES.Identifier
    && node.callee.object.type === AST_NODE_TYPES.CallExpression
    && node.callee.object.callee.type === AST_NODE_TYPES.MemberExpression
    && node.callee.object.callee.object.type === AST_NODE_TYPES.CallExpression
    && node.callee.object.callee.object.callee.type === AST_NODE_TYPES.Identifier
    &&  BigtestToplevelName.hasOwnProperty(node.callee.object.callee.object.callee.name)
}
