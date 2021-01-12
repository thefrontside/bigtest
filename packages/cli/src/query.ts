import { ResultStatus, ErrorDetails, LogEvent, TestResult } from '@bigtest/suite';

const fragments = `
  fragment ErrorDetails on Error {
    message
    stack(showInternal: $showInternalStackTrace, showDependencies: $showDependenciesStackTrace) {
      code @include(if: $showStackTraceCode)
      column
      fileName
      line
      source {
        column
        fileName
        line
      }
    }
  }

  fragment LogDetails on LogEvent {
    ... on LogEventMessage {
      type
      occurredAt
      message {
        level
        text
      }
    }
    ... on LogEventError {
      type
      occurredAt
      error { ...ErrorDetails }
    }
  }
`

export function run(): string {
  return fragments + `
    subscription(
      $files: [String!]! = [],
      $showInternalStackTrace: Boolean! = true,
      $showDependenciesStackTrace: Boolean! = true,
      $showStackTraceCode: Boolean! = true,
      $showLog: Boolean! = true
    ) {
      event: run(files: $files) {
        type
        status
        agentId
        testRunId
        path
        error { ...ErrorDetails }
        logEvents @include(if: $showLog) { ...LogDetails }
      }
    }`
}

export function test(): string {
  return fragments + `
    fragment TestDetails on TestResult {
      description
      status
      steps {
        description
        status
        timeout
        error { ...ErrorDetails }
        logEvents @include(if: $showLog) { ...LogDetails }
      }
      assertions {
        description
        status
        timeout
        error { ...ErrorDetails }
        logEvents @include(if: $showLog) { ...LogDetails }
      }
    }

    query TestRun(
      $testRunId: String!
      $showInternalStackTrace: Boolean! = true,
      $showDependenciesStackTrace: Boolean! = true,
      $showStackTraceCode: Boolean! = true,
      $showLog: Boolean! = true,
      $coverage: Boolean! = false
    ) {
      testRun(id: $testRunId) {
        status
        error { ...ErrorDetails }
        coverage @include(if: $coverage)
        agents {
          agent {
            agentId
            browser {
              name
            }
          }
          summary {
            stepCounts { ok, failed, disregarded }
            assertionCounts { ok, failed, disregarded }
          }
          result {
            ...TestDetails
            children {
              ...TestDetails
              children {
                ...TestDetails
                children {
                  ...TestDetails
                  children {
                    ...TestDetails
                    children {
                      ...TestDetails
                      children {
                        ...TestDetails
                        children {
                          ...TestDetails
                          children {
                            ...TestDetails
                            children {
                              ...TestDetails
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `
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

export type RunResult = {
  event: RunResultEvent;
}

export type ResultCounts = { ok: number; failed: number; disregarded: number };
export type ResultSummary = { stepCounts: ResultCounts; assertionCounts: ResultCounts };

export type TestResults = {
  testRun: {
    status: ResultStatus;
    error?: ErrorDetails;
    coverage?: string;
    agents: {
      status: ResultStatus;
      agent: {
        agentId: string;
        browser?: {
          name: string | undefined;
        };
      };
      summary: ResultSummary;
      result: TestResult;
    }[];
  };
}
