export function run() {
  return `
    subscription {
      run {
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



export function testRunResults(testRunId: string) {
  return `
    fragment TestData on TestResult {
      description
      status
      steps { description, status }
      assertions { description, status }
    }

    query {
      testRun(id: "${testRunId}") {
        testRunId
        status
        agents {
          status
          agent {
            agentId
          }
          result {
            ...TestData
            children {
              ...TestData
              children {
                ...TestData
                children {
                  ...TestData
                }
              }
            }
          }
        }
      }
    }
  `
}
