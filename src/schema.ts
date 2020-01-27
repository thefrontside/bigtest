import { buildSchema } from 'graphql';

export const schema =  buildSchema(`

type Query {
  echo(text: String!): String
  agents: [Agent]
}

type Agent {
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
`);
