# Changelog

## 0.11.0

### Minor Changes

- 1ea83ac4: Add ability to load app from any url, not just a locally managed server
- 46bee8bc: extract `@bigtest/client` out so that any javascript environment can
  connect to a bigtest orchestrator
- d4e7046c: Resolve source maps in error stack traces for better debugging

### Patch Changes

- 7a9c43d1: make Bundler a top level entity
- 83153e3f: Upgrade effection dependencies to latest versions, upgrade to new style of subscriptions
- Updated dependencies [3e95a130]
- Updated dependencies [1ea83ac4]
- Updated dependencies [736acf52]
- Updated dependencies [73d1b0b5]
- Updated dependencies [46bee8bc]
- Updated dependencies [931a91fd]
- Updated dependencies [62252502]
- Updated dependencies [b2c5597f]
- Updated dependencies [d4e7046c]
- Updated dependencies [8afb1cee]
- Updated dependencies [83153e3f]
- Updated dependencies [f5092973]
  - @bigtest/effection-express@0.7.0
  - @bigtest/project@0.7.0
  - @bigtest/agent@0.8.0
  - @bigtest/client@0.2.0
  - @bigtest/suite@0.6.0
  - @bigtest/atom@0.8.1
  - @bigtest/bundler@0.8.1
  - @bigtest/effection@0.5.3
  - @bigtest/webdriver@0.6.1
  - @bigtest/globals@0.6.1

## 0.10.0

### Minor Changes

- 3be69744: Create a bunlder state and use the atom to broadcast error info.
- 3d9d7d64: make Atom#slice and Slice#slice strongly typed and update references.

### Patch Changes

- a6332db3: replace glob with globby
- e950715a: Add missing typescript dev dependency to eliminate yarn warnings. Also, upgraded typescript to 3.9.7 to make it consistent.
- Updated dependencies [3be69744]
- Updated dependencies [1728dda8]
- Updated dependencies [3d9d7d64]
- Updated dependencies [5f09e43f]
- Updated dependencies [e950715a]
  - @bigtest/bundler@0.8.0
  - @bigtest/project@0.6.0
  - @bigtest/atom@0.8.0
  - @bigtest/webdriver@0.6.0
  - @bigtest/agent@0.7.3
  - @bigtest/driver@0.5.3
  - @bigtest/effection@0.5.2
  - @bigtest/suite@0.5.3

## 0.9.1

### Patch Changes

- Updated dependencies [80d68ef0]
  - @bigtest/bundler@0.7.0

## 0.9.0

### Minor Changes

- f527acd7: ensure that app is not considered ready until it is successfully
  serving html responses, not just accepting socket connections

### Patch Changes

- Updated dependencies [2c54420b]
  - @bigtest/driver@0.5.2

## 0.8.1

### Patch Changes

- 7063bce3: Work around bug in node.js that throws warnings when using `fs.promises.truncate()`: https://github.com/nodejs/node/issues/34189
- Updated dependencies [7063bce3]
- Updated dependencies [7063bce3]
- Updated dependencies [942ff150]
  - @bigtest/bundler@0.6.1
  - @bigtest/agent@0.7.2

## 0.8.0

### Minor Changes

- 6bd0e8a5: Refactor the manifest builder to use Rollup instead of Parcel.

### Patch Changes

- Updated dependencies [9ebb822d]
- Updated dependencies [9ebb822d]
- Updated dependencies [9ebb822d]
- Updated dependencies [9ebb822d]
- Updated dependencies [6bd0e8a5]
  - @bigtest/atom@0.7.0
  - @bigtest/bundler@0.6.0
  - @bigtest/webdriver@0.5.4
  - @bigtest/agent@0.7.1

## 0.7.0

### Minor Changes

- c6c5efc5: Copy manifests to dist/ and update sourceMappingURL

### Patch Changes

- Updated dependencies [3cbefaed]
- Updated dependencies [ea5784a8]
  - @bigtest/parcel@0.5.2
  - @bigtest/agent@0.7.0

## 0.6.1

### Patch Changes

- Updated dependencies [b215166e]
- Updated dependencies [d62c4e2b]
- Updated dependencies [ae576595]
- Updated dependencies [65b0156c]
  - @bigtest/agent@0.6.0
  - @bigtest/globals@0.6.0
  - @bigtest/suite@0.5.2

## 0.6.0

### Minor Changes

- 981dc561: Add GraphQL subscriptions for streaming results of a test run
- d671a894: The agent and proxy servers are merged into one, so that they can run on the same port.

### Patch Changes

- Updated dependencies [e7855d80]
- Updated dependencies [c3633b37]
- Updated dependencies [dbc25fa3]
- Updated dependencies [6df5d976]
- Updated dependencies [d671a894]
- Updated dependencies [e0822c30]
  - @bigtest/agent@0.5.2
  - @bigtest/atom@0.6.0
  - @bigtest/effection-express@0.6.0
  - @bigtest/webdriver@0.5.2

## 0.5.1

### Patch Changes

- d2d50a5b: upgrade effection
- Updated dependencies [d2d50a5b]
  - @bigtest/agent@0.5.1
  - @bigtest/atom@0.5.1
  - @bigtest/driver@0.5.1
  - @bigtest/effection@0.5.1
  - @bigtest/effection-express@0.5.1
  - @bigtest/logging@0.5.1
  - @bigtest/parcel@0.5.1
  - @bigtest/project@0.5.1
  - @bigtest/suite@0.5.1
  - @bigtest/webdriver@0.5.1

## 0.5.0

### Minor Changes

- 154b93a1: Introduce changesets for simpler release management

### Patch Changes

- eb34af8e: make @bigtest/project a dependency, not peer dependency
- a3b536cb: make agent capable of being used in different contexts
  - start() sends connection message
  - agent has new `commands` iterable.
- 1b7fa0f1: upgrade version of @effection/events to 0.7.1
- Updated dependencies [358e07ab]
- Updated dependencies [154b93a1]
- Updated dependencies [e407d8dc]
- Updated dependencies [a3b536cb]
- Updated dependencies [1b7fa0f1]
- Updated dependencies [e10b9c52]
  - @bigtest/project@0.5.0
  - @bigtest/agent@0.5.0
  - @bigtest/atom@0.5.0
  - @bigtest/driver@0.5.0
  - @bigtest/effection@0.5.0
  - @bigtest/effection-express@0.5.0
  - @bigtest/logging@0.5.0
  - @bigtest/parcel@0.5.0
  - @bigtest/suite@0.5.0
  - @bigtest/webdriver@0.5.0
    All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2020-03-24

### Changed

- fix npm tarball to actually include javascript sources
