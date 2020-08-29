import {
  TSESTree,
} from '@typescript-eslint/experimental-utils';

// toplevel test name.  test right now but could be 'test' | 'describe' | 'scenario' etc.
export type BigtestTopLevelFunctionName = 'test';

interface BigtestFunctionIdentifier<FunctionName extends BigtestTopLevelFunctionName>
  extends TSESTree.Identifier {
  name: FunctionName;
}

export interface BigtestFunctionCallExpressionWithIdentifierCallee<
  FunctionName extends BigtestTopLevelFunctionName
> extends TSESTree.CallExpression {
  callee: BigtestFunctionIdentifier<FunctionName>;
}

export type BigtestFunctionCallExpression<
  FunctionName extends BigtestTopLevelFunctionName
> =BigtestFunctionCallExpressionWithIdentifierCallee<FunctionName>;