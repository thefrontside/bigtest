import { buildSchema } from 'graphql';

export const schema = buildSchema(`
scalar TestRunId

type Query {
  echo(text: String!): String
  agents: [Agent!]!
  manifest: Manifest!
}

type Mutation {
  run: TestRunId
}

type Agent {
  identifier: String!
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

type Manifest {
  url: String!
  sources: [String!]!
  suite: Test!
}

type Test {
  id: String!
  path: [String!]!
  description: String!
  steps: [Step!]!
  assertions: [Assertion!]!
  children: [Test!]!
}

type Step {
  path: [String!]!
  description: String!
}

type Assertion {
  path: [String!]!
  description: String!
}
`);
