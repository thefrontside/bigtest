import { ResultStatus, ErrorDetails } from '@bigtest/suite';

export function run() {
  return `
    subscription($showInternalStackTrace: Boolean! = true, $showDependenciesStackTrace: Boolean! = true, $showStackTraceCode: Boolean! = true) {
      event: run {
        type
        status
        agentId
        testRunId
        path
        error {
          message
          stack(showInternal: $showInternalStackTrace, showDependencies: $showDependenciesStackTrace) {
            name
            fileName
            code @include(if: $showStackTraceCode)
            line
            column
            source {
              fileName
              line
              column
            }
          }
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
  error?: ErrorDetails;
  timeout?: boolean;
}

export type Done = { done: true };

export type RunResult = { event: RunResultEvent } | Done;

export function isDoneResult(result: RunResult): result is Done {
  return !!(result as any).done; // eslint-disable-line @typescript-eslint/no-explicit-any
}
