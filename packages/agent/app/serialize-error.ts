import getSource from 'get-source';
import ErrorStackParser from 'error-stack-parser';
import { StackFrame } from 'error-stack-parser';
import { Operation, spawn, join } from 'effection';
import { ErrorDetails, ErrorStackFrame } from '@bigtest/suite';

interface SourceLocation {
  name?: string;
  line?: number;
  column?: number;
  sourceLine?: string;
  sourceFile: {
    path: string;
  };
}

export function *resolveStackFrames(stackFrames: StackFrame[]): Operation<ErrorStackFrame[]> {
  let children = [];

  for(let stackFrame of stackFrames) {
    children.push(yield spawn(function*() {
      if(stackFrame.fileName && stackFrame.lineNumber && stackFrame.columnNumber) {
        let source = yield getSource.async(stackFrame.fileName);
        let location: SourceLocation = yield source.resolve({ line: stackFrame.lineNumber, column: stackFrame.columnNumber });
        return {
          name: location.name || stackFrame.functionName,
          fileName: stackFrame.fileName,
          code: location.sourceLine,
          line: stackFrame.lineNumber,
          column: stackFrame.columnNumber,
          source: {
            fileName: location.sourceFile.path,
            line: location.line,
            column: location.column
          }
        };
      } else {
        return { fileName: stackFrame.fileName, line: stackFrame.lineNumber, column: stackFrame.columnNumber };
      }
    }));
  }

  let results = [];

  for(let child of children) {
    results.push(yield join(child));
  }

  return results;
}

export function *serializeError(error: unknown): Operation<ErrorDetails> {
  try {
    if(error instanceof Error) {
      let stackFrames = ErrorStackParser.parse(error);

      let resolvedStackFrames: ErrorStackFrame[];
      try {
        resolvedStackFrames = yield resolveStackFrames(stackFrames);
      } catch {
        resolvedStackFrames = [];
      }

      return { name: error.name, message: error.message, stack: resolvedStackFrames };
    } else {
      return {
        message: error ? `${error}` : 'unknown error'
      }
    }
  } catch {
    return { message: 'unknown error' }
  }
}
