import { buildSchema } from 'graphql';

export const schema = buildSchema(`
type Query {
  echo(text: String!): String
  agents: [Agent!]!
  agent(id: String!): Agent
  manifest: Test!
  testRuns: [TestRun!]!
  testRun(id: String!): TestRun
}

type Mutation {
  run: String
}

type Agent {
  agentId: String!
  browser: Browser!
  os: OS!
  platform: Platform!
  engine: Engine!
}

type Browser {
  name: String!
  version: String!
}

type OS {
  name: String!
  version: String!
  versionName: String!
}

type Platform {
  type: String!
  vendor: String!
}

type Engine {
  name: String!
  version: String!
}

type Test {
  description: String!
  fileName: String
  steps: [Step!]!
  assertions: [Assertion!]!
  children: [Test!]!
}

type Step {
  description: String!
}

type Assertion {
  description: String!
}

type TestRun {
  testRunId: String!
  status: String!
  agent: Agent!
  tree: TestResult!
}

type TestResult {
  description: String!
  status: String!
  steps: [StepResult!]!
  assertions: [AssertionResult!]!
  children: [TestResult!]!
}

type StepResult {
  description: String!
  status: String!
  error: Error
}

type AssertionResult {
  description: String!
  status: String!
  error: Error
}

type Error {
  message: String!
  fileName: String!
  lineNumber: Int!
  columnNumber: Int!
  stack: String!
}
`);
