import { ResultStatus, ErrorDetails, LogEvent } from '@bigtest/suite';

export function run() {
  return `
    fragment ErrorDetails on Error {
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

    subscription(
      $showInternalStackTrace: Boolean! = true,
      $showDependenciesStackTrace: Boolean! = true,
      $showStackTraceCode: Boolean! = true,
      $showUncaughtErrors: Boolean! = true,
      $showLog: Boolean! = true
    ) {
      event: run {
        type
        status
        agentId
        testRunId
        path
        error {
          ...ErrorDetails
        }
        logEvents @include(if: $showLog) {
          ... on LogEventMessage {
            type
            occurredAt
            message
          }
          ... on LogEventError {
            type
            occurredAt
            error
          }
        }
      }
    }`
}

export type RunResultEvent = {
  type: string;
  agentId: string;
  description: string;
  testRunId: string;
  status?: ResultStatus;
  path?: string[];
  error?: ErrorDetails;
  timeout?: boolean;
  logEvents?: LogEvent[];
}

export type Done = { done: true };

export type RunResult = { event: RunResultEvent } | Done;

export function isDoneResult(result: RunResult): result is Done {
  return !!(result as any).done; // eslint-disable-line @typescript-eslint/no-explicit-any
}
