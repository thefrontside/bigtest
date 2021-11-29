# @bigtest/cli

## 0.22.1

### Patch Changes

- 26de9edd: Add effection labels to parts of the system, for better debugging with the effection inspector
- 03984b25: Upgrade to Effection 2.0.1
- 8b748748: Use duplex channel from @effection/duplex-channel
- 62320b87: upgrade @frontside/eslint-config and, @frontside/typescript packages
- Updated dependencies [26de9edd]
- Updated dependencies [03984b25]
- Updated dependencies [8b748748]
- Updated dependencies [62320b87]
  - @bigtest/server@0.27.1
  - @bigtest/client@0.5.1
  - @bigtest/project@0.17.1

## 0.22.0

### Minor Changes

- 1473a93b: Rewrite result aggregator and result stream for improved performance

### Patch Changes

- Updated dependencies [74781e51]
- Updated dependencies [27657eec]
- Updated dependencies [1473a93b]
  - @bigtest/server@0.27.0

## 0.21.0

### Minor Changes

- 11925e0e: Upgrade effection to beta.21

### Patch Changes

- Updated dependencies [11925e0e]
  - @bigtest/client@0.5.0
  - @bigtest/effection@0.9.0
  - @bigtest/project@0.17.0
  - @bigtest/server@0.26.0

## 0.20.1

### Patch Changes

- 3f8cf9a5: Fix start server timeout doesn't cancel
- feaa260b: Add homepage links to packages
- 243ca0c8: Remove @bigtest/performance dependency
- Updated dependencies [9682c92d]
- Updated dependencies [feaa260b]
  - @bigtest/effection@0.8.0
  - @bigtest/client@0.4.1
  - @bigtest/project@0.16.1
  - @bigtest/server@0.25.1

## 0.20.0

### Minor Changes

- 08b9cd32: Upgrade to Effection v2 beta

### Patch Changes

- Updated dependencies [08b9cd32]
  - @bigtest/client@0.4.0
  - @bigtest/effection@0.7.0
  - @bigtest/performance@0.6.0
  - @bigtest/project@0.16.0
  - @bigtest/server@0.25.0

## 0.19.0

### Minor Changes

- e1395f56: Allow options to be cleared by providing an empty string

### Patch Changes

- 4762d0d9: Update effection dependencies to v1
- Updated dependencies [4762d0d9]
  - @bigtest/client@0.3.3
  - @bigtest/effection@0.6.3
  - @bigtest/project@0.15.2
  - @bigtest/server@0.24.1

## 0.18.2

### Patch Changes

- 08b07d78: Update effection to 0.8.0 and update subpackages
- d801d1f6: Track orchstrator status in state, remove delegate
- Updated dependencies [08b07d78]
- Updated dependencies [22903431]
- Updated dependencies [d801d1f6]
  - @bigtest/client@0.3.2
  - @bigtest/effection@0.6.2
  - @bigtest/project@0.15.1
  - @bigtest/server@0.24.0

## 0.18.1

### Patch Changes

- Updated dependencies [d28b494f]
- Updated dependencies [c19de909]
  - @bigtest/project@0.15.0
  - @bigtest/server@0.23.0

## 0.18.0

### Minor Changes

- d0097929: Add support for edge on windows and use it as the default driver

### Patch Changes

- Updated dependencies [a7afe9b7]
- Updated dependencies [d0097929]
  - @bigtest/server@0.22.2
  - @bigtest/project@0.14.0

## 0.17.0

### Minor Changes

- 74f4b33c: Modify default name of generated tsconfig of bigtest cli init command

### Patch Changes

- 4d7c43f9: enable eslint rules from the latest @typescript-eslint/recommended
- d85e5e95: upgrade eslint, typescript and @frontside packages
- Updated dependencies [4d7c43f9]
- Updated dependencies [d39028e2]
- Updated dependencies [d85e5e95]
  - @bigtest/client@0.3.1
  - @bigtest/effection@0.6.1
  - @bigtest/project@0.13.1
  - @bigtest/server@0.22.0

## 0.16.2

### Patch Changes

- Updated dependencies [581a100e]
- Updated dependencies [eea76b5f]
- Updated dependencies [0df559a9]
- Updated dependencies [0c30e69d]
  - @bigtest/server@0.21.0

## 0.16.1

### Patch Changes

- 15015975: Fix broken CLI package distributions

## 0.16.0

### Minor Changes

- 3bf116f8: pass the whole service slice of options and status into the service
- 85891d0a: add missing eslint peer dependencies
- c052e7e2: upgrade bundler dependencies mainly to get type definitions for @rollup/plugin-babel

### Patch Changes

- d7a1ee72: check bin scripts under source control. This simplifies build scripts and makes building in windows simpler
- c2c4bd11: Upgrade @frontside/typescript to v1.1.0
- 2914cdcb: Change the default suggested app port to 3000 in bigtest init
- Updated dependencies [7a39af49]
- Updated dependencies [ee797ddf]
- Updated dependencies [3bf116f8]
- Updated dependencies [c2c4bd11]
- Updated dependencies [ee797ddf]
- Updated dependencies [6bfcb3ae]
- Updated dependencies [2603129b]
- Updated dependencies [85891d0a]
- Updated dependencies [6af43e28]
- Updated dependencies [c052e7e2]
- Updated dependencies [ee797ddf]
  - @bigtest/server@0.20.0
  - @bigtest/effection@0.6.0
  - @bigtest/project@0.13.0

## 0.15.2

### Patch Changes

- 88bcd2c1: When an unexpected error happens in the CLI, catch it, let the user
  know it is our fault, and generate a link to a github issue containing
  diagnostic information
- Updated dependencies [c6e96302]
- Updated dependencies [393fee75]
  - @bigtest/server@0.19.0

## 0.15.1

### Patch Changes

- Updated dependencies [9b2749b0]
- Updated dependencies [5d7e6e85]
- Updated dependencies [8731eda0]
  - @bigtest/server@0.18.0

## 0.15.0

### Minor Changes

- 2b6f0108: Print log output when running with --show-log
- e5606e61: Fail build on TypeScript errors and add support for tsconfig file
- 00b424db: Introduce printer to simplify formatting code, formatter constructor takes printer as an argument

### Patch Changes

- fe71c944: Use new @effection/node process api internally
- Updated dependencies [eff8120f]
- Updated dependencies [fe71c944]
- Updated dependencies [eac55306]
- Updated dependencies [e5606e61]
- Updated dependencies [e0caff7a]
- Updated dependencies [37cd06be]
- Updated dependencies [ad2ea478]
  - @bigtest/server@0.17.0
  - @bigtest/project@0.12.0

## 0.14.1

### Patch Changes

- cdf3ee9a: Improve formatting of stack traces
  - @bigtest/server@0.16.2

## 0.14.0

### Minor Changes

- 4b54d9f9: Add an interactive `init` command

### Patch Changes

- Updated dependencies [4b54d9f9]
  - @bigtest/project@0.11.0
  - @bigtest/server@0.16.1

## 0.13.0

### Minor Changes

- 248d6ddc: produce coverage reports by passing the `--coverage` option to the
  `test` and `ci` commands

### Patch Changes

- Updated dependencies [248d6ddc]
  - @bigtest/server@0.16.0
  - @bigtest/project@0.10.0

## 0.12.0

### Minor Changes

- c5952202: Don't watch test files when running CI command
- ee45f0bd: Formatters can be functions in addition to objects
- abc69ff6: Filter test run by file path
- fbc7b237: Add --start-timeout option, if server start takes too long, eventually time out
- 934cfa72: Fail test run if there are errors in the test files

### Patch Changes

- 5d1a0806: Show correct assertion counts
- 1e643719: App command and app url are passed down into options
- Updated dependencies [c5952202]
- Updated dependencies [abc69ff6]
- Updated dependencies [f1846f07]
- Updated dependencies [22145f61]
- Updated dependencies [934cfa72]
  - @bigtest/project@0.9.0
  - @bigtest/server@0.15.0

## 0.11.0

### Minor Changes

- 0da756c5: Improve CLI output and enable swappable formatters

### Patch Changes

- Updated dependencies [0da756c5]
  - @bigtest/server@0.14.0

## 0.10.0

### Minor Changes

- 375ec663: Track console messages and uncaught errors and make them available via the API

### Patch Changes

- Updated dependencies [375ec663]
  - @bigtest/server@0.13.0

## 0.9.0

### Minor Changes

- b5ec3cb6: Change format of CLI arguments from --app.url to --app-url, etc...
- b5ec3cb6: Remove default app and `--no-app.command` option. If no app is provided, none will be launched.

### Patch Changes

- 804210f6: Upgraded @effection/subscription and applied new chainability
- 969532b6: Improve error format when trying to launch driver which doesn't exist
- fb882344: default test output for CLI now shows dots for progress, and then the
  path to the failure (if any) as a tree.
- Updated dependencies [804210f6]
- Updated dependencies [837a4630]
- Updated dependencies [83a68db6]
- Updated dependencies [b5ec3cb6]
- Updated dependencies [0604464c]
  - @bigtest/client@0.3.0
  - @bigtest/effection@0.5.4
  - @bigtest/server@0.12.0
  - @bigtest/project@0.8.0

## 0.8.0

### Minor Changes

- 1ea83ac4: Add ability to load app from any url, not just a locally managed server
- 46bee8bc: extract `@bigtest/client` out so that any javascript environment can
  connect to a bigtest orchestrator
- d4e7046c: Resolve source maps in error stack traces for better debugging

### Patch Changes

- 62252502: Provide a nice error message when running tests without a server
- 83153e3f: Upgrade effection dependencies to latest versions, upgrade to new style of subscriptions
- Updated dependencies [1ea83ac4]
- Updated dependencies [7a9c43d1]
- Updated dependencies [46bee8bc]
- Updated dependencies [62252502]
- Updated dependencies [d4e7046c]
- Updated dependencies [83153e3f]
- Updated dependencies [f5092973]
  - @bigtest/project@0.7.0
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
