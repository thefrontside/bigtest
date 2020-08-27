import * as getSource from 'get-source';
import * as ErrorStackParser from 'error-stack-parser';
import { Operation } from 'effection';
import { ErrorDetails } from '@bigtest/suite';

interface SourceLocation {
  name?: string;
  line?: number;
  column?: number;
  sourceFile: {
    path: string;
  };
}

export function *serializeError(error: Error): Operation<ErrorDetails> {
  let parsedError = yield Promise.all(ErrorStackParser.parse(error).map(async (stackFrame) => {
    if(stackFrame.fileName && stackFrame.lineNumber && stackFrame.columnNumber) {
      let source = await getSource.async(stackFrame.fileName);
      let location: SourceLocation = await source.resolve({ line: stackFrame.lineNumber, column: stackFrame.columnNumber });
      return {
        name: location.name || stackFrame.functionName,
        fileName: stackFrame.fileName,
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
  return {
    name: error.name,
    message: error.message,
    stack: parsedError
  };
}
