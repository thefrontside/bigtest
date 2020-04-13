export function run() {
  return `
    mutation {
      run
    }
  `
}

export function testRunResults() {
  return `
    fragment TestData on TestResult {
      description
      status
      steps { description, status }
      assertions { description, status }
    }

    query {
      agents {
        agentId
        browser { name, version }
      }
      testRuns {
        testRunId
        tree {
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
  `
}
