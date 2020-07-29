import { ResultStatus } from '@bigtest/suite';

export function run() {
  return `
    subscription {
      event: run {
        type
        status
        testRunId
        path
        timeout
        agent {
          id
          browser {
            name
          }
        }
        error {
          message
          fileName
          lineNumber
          columnNumber
          stack
        }
      }
    }`
}

export type RunResultEvent = {
  type: string;
  testRunId: string;
  status?: ResultStatus;
  path?: string[];
  timeout?: boolean;
  agent: {
    id: string;
    browser: {
      name: string;
    };
  };
  error?: {
    message: string;
    fileName?: string;
    lineNumber?: string;
    columnNumber?: string;
    stack?: string;
  };
}

export type Done = { done: true };

export type RunResult = { event: RunResultEvent } | Done;

export function isDoneResult(result: RunResult): result is Done {
  return !!(result as any).done; // eslint-disable-line @typescript-eslint/no-explicit-any
}
