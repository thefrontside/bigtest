# @bigtest/cli

## 0.8.0

### Minor Changes

- 46bee8bc: extract `@bigtest/client` out so that any javascript environment can
  connect to a bigtest orchestrator
- d4e7046c: Resolve source maps in error stack traces for better debugging

### Patch Changes

- 62252502: Provide a nice error message when running tests without a server
- 83153e3f: Upgrade effection dependencies to latest versions, upgrade to new style of subscriptions
- Updated dependencies [7a9c43d1]
- Updated dependencies [46bee8bc]
- Updated dependencies [62252502]
- Updated dependencies [d4e7046c]
- Updated dependencies [83153e3f]
- Updated dependencies [f5092973]
  - @bigtest/server@0.11.0
  - @bigtest/client@0.2.0
  - @bigtest/effection@0.5.3

## 0.7.3

### Patch Changes

- e950715a: Add missing typescript dev dependency to eliminate yarn warnings. Also, upgraded typescript to 3.9.7 to make it consistent.
- Updated dependencies [a6332db3]
- Updated dependencies [3be69744]
- Updated dependencies [3d9d7d64]
- Updated dependencies [e950715a]
  - @bigtest/server@0.10.0
  - @bigtest/project@0.6.0
  - @bigtest/effection@0.5.2

## 0.7.2

### Patch Changes

- 80d68ef0: set process.env.NODE_ENV='production' inside the test bundle. This
  will ensure that 3rd party packages that depend on this will continue
  to function
  - @bigtest/server@0.9.1

## 0.7.1

### Patch Changes

- Updated dependencies [f527acd7]
  - @bigtest/server@0.9.0

## 0.7.0

### Minor Changes

- c07415a4: Set exit code based on result of running test suite

### Patch Changes

- Updated dependencies [7063bce3]
  - @bigtest/server@0.8.1

## 0.6.3

### Patch Changes

- Updated dependencies [6bd0e8a5]
  - @bigtest/server@0.8.0

## 0.6.2

### Patch Changes

- Updated dependencies [c6c5efc5]
  - @bigtest/server@0.7.0

## 0.6.1

### Patch Changes

- f2ca496e: use @bigtest/performance to ponyfill performance apis

## 0.6.0

### Minor Changes

- 6cd196e5: Add streaming output to CLI package, and start on abstract formatter interface.

### Patch Changes

- 9f9bd795: better code re-use within the CLI
- Updated dependencies [981dc561]
- Updated dependencies [d671a894]
  - @bigtest/server@0.6.0

## 0.5.1

### Patch Changes

- d2d50a5b: upgrade effection
- Updated dependencies [d2d50a5b]
  - @bigtest/effection@0.5.1
  - @bigtest/project@0.5.1
  - @bigtest/server@0.5.1

## 0.5.0

### Minor Changes

- 154b93a1: Introduce changesets for simpler release management

### Patch Changes

- a3b536cb: make agent capable of being used in different contexts
  - start() sends connection message
  - agent has new `commands` iterable.
- 1b7fa0f1: upgrade version of @effection/events to 0.7.1
- Updated dependencies [358e07ab]
- Updated dependencies [eb34af8e]
- Updated dependencies [154b93a1]
- Updated dependencies [a3b536cb]
- Updated dependencies [1b7fa0f1]
- Updated dependencies [e10b9c52]
  - @bigtest/project@0.5.0
  - @bigtest/server@0.5.0
  - @bigtest/effection@0.5.0
