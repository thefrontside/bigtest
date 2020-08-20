# @bigtest/client

Interact with a remote bigtest server with effection-native operations

## Synopsis

The client class allows you to evaluate GraphQL queries, mutations,
and subscriptions against a remote bigtest orchestrator. It also has
the capacity to run "live" queries which return new results for the
query every time that the internal state changes.

``` javascript
import { Client } from `@bigtest/client`;

export function* countAgentsAt(url) {
  // create the client. After this operation completes, the client
  // will be connected to the orchestrator over websockets.
  let client = yield Client.create(url);


  let result = yield client.query(`{ agents { agentId } }`);

  return result.agents.length;
}
```

To run the tests:

``` sh
$ yarn test
```
