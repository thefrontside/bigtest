import {
  TSESTree,
  AST_NODE_TYPES
} from '@typescript-eslint/experimental-utils';
import { createRule } from './utils';

export const requireDefaultTextExport = createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Require a BigTest test file to have a default export',
      recommended: 'error',
    },
    messages: {
      exportIsNotTest: 'The test file does not have a default export',
      namedExport: 'Test files must have a default export'
    },
    type: 'problem',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    // ignore non-modules
    if (context.parserOptions.sourceType !== 'module') {
      return {}
    }
    
    let defaultExport: TSESTree.ExportDefaultDeclaration;
    let namedExport: TSESTree.ExportNamedDeclaration;
    let hasDefaultTestDeclaration = false;

     return {
      'Program:exit'() {
        if(hasDefaultTestDeclaration){
          return;
        }
        
        if (defaultExport) {
          context.report({ node: defaultExport || namedExport, messageId: 'exportIsNotTest'});
          return;
        }

        context.report({ node: context.getSourceCode().ast, messageId: 'namedExport' })
      },

      ExportNamedDeclaration(
        node: TSESTree.ExportNamedDeclaration
      ) {
        namedExport = node;
      },
      // commonjs
      // module.exports =
      // exports =
      MemberExpression(node) {
        if (node.type !== AST_NODE_TYPES.MemberExpression ||
            node.object.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        if (node.object.name !== 'module' && node.object.name !== 'exports' || !node.parent) {
          return;
        }

        if(node.parent.type !== AST_NODE_TYPES.AssignmentExpression) {
          return;
        }
        
        if(node.parent.operator !== '=') {
          return;
        }

        hasDefaultTestDeclaration = true;
      },
      ExportDefaultDeclaration(
        node: TSESTree.ExportDefaultDeclaration,
      ) {
        if( [AST_NODE_TYPES.CallExpression, AST_NODE_TYPES.ObjectExpression].includes(node.declaration.type)) {
          hasDefaultTestDeclaration = true;
        } else {
          defaultExport = node;
        }
      },
    };
  },
});
