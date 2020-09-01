# @bigtest/agent

## 0.8.0

### Minor Changes

- 73d1b0b5: Set step timeout to 60s and throw agent warning if interactor timeout is >= step timeout.
- 931a91fd: Each sequence of related side-effects for a test (or lane in bigtest
  jargon) is now run in its own fresh javascript context so that no
  global variables or state can leak
- d4e7046c: Resolve source maps in error stack traces for better debugging

### Patch Changes

- 736acf52: provide new channel-based `AgentHandler` class for managing a set of
  agents from within any JavaScript process.
- b2c5597f: Remove Mailbox interface that weren't being used in the agent
- 83153e3f: Upgrade effection dependencies to latest versions, upgrade to new style of subscriptions
- Updated dependencies [3e95a130]
- Updated dependencies [8afb1cee]
- Updated dependencies [83153e3f]
  - @bigtest/effection-express@0.7.0
  - @bigtest/effection@0.5.3
  - @bigtest/globals@0.6.1

## 0.7.3

### Patch Changes

- e950715a: Add missing typescript dev dependency to eliminate yarn warnings. Also, upgraded typescript to 3.9.7 to make it consistent.
- Updated dependencies [e950715a]
  - @bigtest/effection@0.5.2

## 0.7.2

### Patch Changes

- 942ff150: make @bigtest/interactor a devDependency only since it is only used in
  tests

## 0.7.1

### Patch Changes

- Updated dependencies [4c695f0e]
  - @bigtest/interactor@0.14.0

## 0.7.0

### Minor Changes

- ea5784a8: Proxy fetch and XMLHttpRequest through agent frame, enables mocking of requests

### Patch Changes

- Updated dependencies [30647e65]
  - @bigtest/interactor@0.13.0

## 0.6.1

### Patch Changes

- b8c5d65f: Wait for test frame to be cleared

## 0.6.0

### Minor Changes

- b215166e: The running of the lanes has been moved from the harness to the agent.
- d62c4e2b: Add an app interactor which can be used to load the application into the test frame. Agent no longer loads app automatically.

### Patch Changes

- Updated dependencies [d62c4e2b]
- Updated dependencies [65b0156c]
  - @bigtest/globals@0.6.0

## 0.5.2

### Patch Changes

- e7855d80: Split `AgentEvent` type into a union of two types
- Updated dependencies [d671a894]
  - @bigtest/effection-express@0.6.0

## 0.5.1

### Patch Changes

- d2d50a5b: upgrade effection
- Updated dependencies [d2d50a5b]
  - @bigtest/effection@0.5.1
  - @bigtest/effection-express@0.5.1

## 0.5.0

### Minor Changes

- 154b93a1: Introduce changesets for simpler release management
- a3b536cb: make agent capable of being used in different contexts
  - start() sends connection message
  - agent has new `commands` iterable.

### Patch Changes

- 1b7fa0f1: upgrade version of @effection/events to 0.7.1
- Updated dependencies [154b93a1]
- Updated dependencies [1b7fa0f1]
- Updated dependencies [e10b9c52]
  - @bigtest/effection@0.5.0
  - @bigtest/effection-express@0.5.0
