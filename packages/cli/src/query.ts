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

export function run() {
  return fragments + `
    subscription(
      $showInternalStackTrace: Boolean! = true,
      $showDependenciesStackTrace: Boolean! = true,
      $showStackTraceCode: Boolean! = true,
      $showLog: Boolean! = true
    ) {
      event: run {
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

export function test() {
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
      $showLog: Boolean! = true
    ) {
      testRun(id: $testRunId) {
        status
        agents {
          agent {
            agentId
            browser {
              name
            }
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

export type TestResults = {
  testRun: {
    status: ResultStatus;
    agents: {
      status: ResultStatus;
      agent: {
        agentId: string;
        browser?: {
          name: string | undefined;
        };
      };
      result: TestResult;
    }[];
  };
}

