# @bigtest/client

## 0.3.0

### Minor Changes

- 0604464c: update Client.subscription() and Client.liveQuery() methods to return
  an effection `Subscription` instead of a Mailbox

### Patch Changes

- 804210f6: Upgraded @effection/subscription and applied new chainability

## 0.2.0

### Minor Changes

- 46bee8bc: extract `@bigtest/client` out so that any javascript environment can
  connect to a bigtest orchestrator
- f5092973: Add support for variables in GraphQL queries

### Patch Changes

- 62252502: Provide a nice error message when running tests without a server
- 83153e3f: Upgrade effection dependencies to latest versions, upgrade to new style of subscriptions
- Updated dependencies [83153e3f]
  - @bigtest/effection@0.5.3
