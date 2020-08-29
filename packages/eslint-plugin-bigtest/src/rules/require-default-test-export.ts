import {
  TSESTree,
  AST_NODE_TYPES
} from '@typescript-eslint/experimental-utils';
import { createRule, isTopLevelTest } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Require a bigtest test to have 1 default export',
      recommended: 'error',
    },
    messages: {
      exportIsNotTest: 'The default export is not a test implementation',
      namedExport: 'Only default test implementations are allowed'
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
        
        if(defaultExport) {
          context.report({ node:defaultExport, messageId: 'exportIsNotTest' });
          return;
        }
        
        context.report({ node: namedExport, messageId: 'namedExport'  });
      },

      'ExportNamedDeclaration'(
        node: TSESTree.ExportNamedDeclaration
      ) {
        namedExport = node;
      },
      'ExportDefaultDeclaration'(
        node: TSESTree.ExportDefaultDeclaration,
      ) {
        defaultExport = node;
        
        if(node.declaration.type === AST_NODE_TYPES.CallExpression) {
          hasDefaultTestDeclaration = isTopLevelTest(node.declaration);
        }
      },
    };
  },
});
