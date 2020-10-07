/* eslint-disable prefer-let/prefer-let */
import * as path from 'path';

const cwdPathParams = process.cwd().split(path.sep);

export const cleanUpFilePath = (fileName: string | null): string | null => {
  return fileName == null
    ? fileName
    : Object.entries(fileName.split(path.sep))
        .reduce(
          (cleanFileName, fileNamePart) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fileNamePart[1] !== cwdPathParams[fileNamePart[0] as any]
              ? (cleanFileName += `${path.sep}${fileNamePart[1]}`)
              : cleanFileName,
          ""
        )
        .substring(1);
}


export const wrapStackFrame = (stackFrame: NodeJS.CallSite) => {
  const filePath = stackFrame.getFileName();

  return {
    filePath: cleanUpFilePath(filePath) ?? "",
    fullFilePath: filePath ?? "",
    fileName: path.basename(stackFrame.getFileName() ?? ""),
    lineNumber: stackFrame.getLineNumber(),
    columnNumber: stackFrame.getColumnNumber(),
    isConstructor: stackFrame.isConstructor(),
    functionName: stackFrame.getFunctionName(),
    typeName: stackFrame.getTypeName(),
    methodName: stackFrame.getMethodName(),
  } 
}
