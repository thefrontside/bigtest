import { ResultStatus } from '@bigtest/suite';

export function run() {
  return `
    subscription {
      event: run {
        type
        status
        agentId
        testRunId
        path
        error {
          message
          fileName
          lineNumber
          columnNumber
          stack
        }
        timeout
      }
    }`
}

export type RunResultEvent = {
  type: string;
  agentId: string;
  testRunId: string;
  status?: ResultStatus;
  path?: string[];
  error?: {
    message: string;
    fileName?: string;
    lineNumber?: string;
    columnNumber?: string;
    stack?: string;
  };
  timeout?: boolean;
}

export type Done = { done: true };

export type RunResult = { event: RunResultEvent } | Done;

export function isDoneResult(result: RunResult): result is Done {
  return !!(result as any).done; // eslint-disable-line @typescript-eslint/no-explicit-any
}
