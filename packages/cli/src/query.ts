export function run() {
  return `
    mutation {
      run
    }
  `
}

export function testRunResults(testRunId) {
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
