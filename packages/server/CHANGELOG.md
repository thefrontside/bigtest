# Changelog

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
