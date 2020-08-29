import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { version } from '../../package.json';
import {BigtestFunctionCallExpression, BigtestTopLevelFunctionName } from '../types'
import * as path from 'path';
import { BigtestToplevelName } from '../constants';

const REPO_URL = 'https://github.com/thefrontside/bigtest/eslint-plugin-plugin';

export const createRule = ESLintUtils.RuleCreator(name => {
  let ruleName = path.parse(name).name;

  return `${REPO_URL}/blob/v${version}/docs/rules/${ruleName}.md`;
});

export const isTopLevelTest = (
  node: TSESTree.CallExpression,
): node is BigtestFunctionCallExpression<BigtestTopLevelFunctionName> => {
    if(node.callee.type === AST_NODE_TYPES.MemberExpression 
      && node.callee.property.type === AST_NODE_TYPES.Identifier
      && node.callee.object.type === AST_NODE_TYPES.CallExpression
      && node.callee.object.callee.type === AST_NODE_TYPES.MemberExpression
      && node.callee.object.callee.object.type === AST_NODE_TYPES.CallExpression
      && node.callee.object.callee.object.callee.type === AST_NODE_TYPES.Identifier
      && node.callee.object.callee.object.callee.name === BigtestToplevelName) {
      return true;
    }

    return false;
  }
