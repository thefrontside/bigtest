import { buildSchema } from 'graphql';

export const schema =  buildSchema(`

type Query {
  echo(text: String!): String
}

`);
