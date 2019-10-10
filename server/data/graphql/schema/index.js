import eventSchema from './event';
import { gql } from 'apollo-server-express';

// The `_` (underscores) here signify that the queries, mutations, subscriptions will be extended
// by the rest of the schemas. This schema simply ties them all together.
const linkSchema = gql`
  type Echo {
    exampleField: String!
  }

  type Query {
    _: Boolean
    hello: String
    echoExample(str: String!): Echo
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }

  scalar Date
`;

export default [linkSchema, eventSchema];
