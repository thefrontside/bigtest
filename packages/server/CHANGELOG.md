# Changelog

## 0.25.1

### Patch Changes

- feaa260b: Add homepage links to packages
- Updated dependencies [9a9c4488]
- Updated dependencies [9682c92d]
- Updated dependencies [feaa260b]
- Updated dependencies [d86085fa]
  - @bigtest/webdriver@0.10.0
  - @bigtest/effection@0.8.0
  - @bigtest/effection-express@0.11.0
  - @bigtest/agent@0.18.1
  - @bigtest/bundler@0.14.1
  - @bigtest/client@0.4.1
  - @bigtest/driver@0.6.1
  - @bigtest/globals@0.8.1
  - @bigtest/logging@0.6.1
  - @bigtest/project@0.16.1
  - @bigtest/suite@0.12.1

## 0.25.0

### Minor Changes

- 08b9cd32: Upgrade to Effection v2 beta

### Patch Changes

- Updated dependencies [08b9cd32]
  - @bigtest/agent@0.18.0
  - @bigtest/bundler@0.14.0
  - @bigtest/client@0.4.0
  - @bigtest/driver@0.6.0
  - @bigtest/effection@0.7.0
  - @bigtest/effection-express@0.10.0
  - @bigtest/globals@0.8.0
  - @bigtest/logging@0.6.0
  - @bigtest/project@0.16.0
  - @bigtest/suite@0.12.0
  - @bigtest/webdriver@0.9.0

## 0.24.2

### Patch Changes

- Updated dependencies [7d5e7d5b]
  - @bigtest/bundler@0.13.0

## 0.24.1

### Patch Changes

- 4762d0d9: Update effection dependencies to v1
- Updated dependencies [7a54cf02]
- Updated dependencies [4762d0d9]
  - @bigtest/webdriver@0.8.4
  - @bigtest/agent@0.17.2
  - @bigtest/atom@0.12.2
  - @bigtest/bundler@0.12.5
  - @bigtest/client@0.3.3
  - @bigtest/driver@0.5.7
  - @bigtest/effection@0.6.3
  - @bigtest/effection-express@0.9.4
  - @bigtest/globals@0.7.6
  - @bigtest/project@0.15.2

## 0.24.0

### Minor Changes

- d801d1f6: Track orchstrator status in state, remove delegate

### Patch Changes

- 08b07d78: Update effection to 0.8.0 and update subpackages
- 22903431: Prevent race condition if app server becomes available too early
- Updated dependencies [08b07d78]
  - @bigtest/agent@0.17.1
  - @bigtest/atom@0.12.1
  - @bigtest/bundler@0.12.4
  - @bigtest/client@0.3.2
  - @bigtest/driver@0.5.6
  - @bigtest/effection@0.6.2
  - @bigtest/effection-express@0.9.3
  - @bigtest/globals@0.7.5
  - @bigtest/project@0.15.1
  - @bigtest/webdriver@0.8.2

## 0.23.0

### Minor Changes

- c19de909: Don't wait for manifest builder to start orchestrator

### Patch Changes

- Updated dependencies [d28b494f]
- Updated dependencies [1da4bcfd]
- Updated dependencies [0dacf302]
  - @bigtest/project@0.15.0
  - @bigtest/webdriver@0.8.1
  - @bigtest/suite@0.11.3
  - @bigtest/bundler@0.12.3

## 0.22.2

### Patch Changes

- a7afe9b7: ensure tsconfig config option is present and gets passed to the bundler
- Updated dependencies [a7afe9b7]
- Updated dependencies [d0097929]
  - @bigtest/agent@0.17.0
  - @bigtest/project@0.14.0
  - @bigtest/webdriver@0.8.0
  - @bigtest/bundler@0.12.2

## 0.22.1

### Patch Changes

- 67681235: Add `changeOrigin` flag to proxy server so that app urls served over SSL will work properly

## 0.22.0

### Minor Changes

- d39028e2: implement typescript project references in all packages that have a compiled output

### Patch Changes

- 4d7c43f9: enable eslint rules from the latest @typescript-eslint/recommended
- d85e5e95: upgrade eslint, typescript and @frontside packages
- Updated dependencies [4d7c43f9]
- Updated dependencies [d39028e2]
- Updated dependencies [d85e5e95]
  - @bigtest/agent@0.16.0
  - @bigtest/atom@0.12.0
  - @bigtest/bundler@0.12.1
  - @bigtest/client@0.3.1
  - @bigtest/effection@0.6.1
  - @bigtest/effection-express@0.9.2
  - @bigtest/globals@0.7.4
  - @bigtest/logging@0.5.3
  - @bigtest/project@0.13.1
  - @bigtest/suite@0.11.2
  - @bigtest/webdriver@0.7.2
  - @bigtest/driver@0.5.5

## 0.21.0

### Minor Changes

- 581a100e: make reset private and remove from the Atom interface
- eea76b5f: add atom configuration and remove setMaxListeners
- 0df559a9: readd @babel/preset-typescript to @bigtest/bundler

### Patch Changes

- 0c30e69d: Remove delegate mailboxes in orchestrator
- Updated dependencies [1840b2fd]
- Updated dependencies [25633b44]
  - @bigtest/atom@0.11.0
  - @bigtest/webdriver@0.7.1

## 0.20.0

### Minor Changes

- 3bf116f8: pass the whole service slice of options and status into the service
- 6bfcb3ae: refactor manifest-generator to service and remove MailBox
- 85891d0a: add missing eslint peer dependencies
- 6af43e28: refactor ProxyServer to Service
- c052e7e2: upgrade bundler dependencies mainly to get type definitions for @rollup/plugin-babel

### Patch Changes

- 7a39af49: add cross-env and a test:debug yarn script to @bigtest/server
- c2c4bd11: Upgrade @frontside/typescript to v1.1.0
- ee797ddf: Refactor away command processor, replaces it with the Runner
- Updated dependencies [33a64ac0]
- Updated dependencies [dd0ae975]
- Updated dependencies [ee797ddf]
- Updated dependencies [ada894f4]
- Updated dependencies [c14b56b4]
- Updated dependencies [c2c4bd11]
- Updated dependencies [2603129b]
- Updated dependencies [41018eaf]
- Updated dependencies [6af43e28]
- Updated dependencies [c052e7e2]
- Updated dependencies [ee797ddf]
  - @bigtest/suite@0.11.1
  - @bigtest/webdriver@0.7.0
  - @bigtest/effection@0.6.0
  - @bigtest/agent@0.15.1
  - @bigtest/atom@0.10.1
  - @bigtest/bundler@0.12.0
  - @bigtest/driver@0.5.4
  - @bigtest/effection-express@0.9.1
  - @bigtest/globals@0.7.3
  - @bigtest/logging@0.5.2
  - @bigtest/project@0.13.0

## 0.19.0

### Minor Changes

- c6e96302: Show app errors on test run if application server exits prematurely

### Patch Changes

- 393fee75: Throw non-fetch errors when checking reachability, like for example an invalid URL

## 0.18.0

### Minor Changes

- 9b2749b0: Handle duplicates in step descriptions
- 8731eda0: Redirects to absolute URLs are handled automatically by proxy server

### Patch Changes

- 5d7e6e85: Modernize and test proxy server
- Updated dependencies [9b2749b0]
- Updated dependencies [5d7e6e85]
- Updated dependencies [afd5bcf5]
  - @bigtest/agent@0.15.0
  - @bigtest/effection-express@0.9.0

## 0.17.0

### Minor Changes

- e5606e61: Fail build on TypeScript errors and add support for tsconfig file
- e0caff7a: create Service<O> type and refactor app-service

### Patch Changes

- eff8120f: Don't watch test files in manifest generator if watchTestFiles is false
- fe71c944: Use new @effection/node process api internally
- eac55306: Improve build error formatting
- 37cd06be: Validate manifest, check duplicate tests and nesting depth
- ad2ea478: Don't crash server when manifest cannot be imported
- Updated dependencies [fe71c944]
- Updated dependencies [2b6f0108]
- Updated dependencies [e5606e61]
- Updated dependencies [37cd06be]
  - @bigtest/webdriver@0.6.4
  - @bigtest/agent@0.14.1
  - @bigtest/bundler@0.11.0
  - @bigtest/project@0.12.0
  - @bigtest/suite@0.11.0
  - @bigtest/globals@0.7.2

## 0.16.2

### Patch Changes

- Updated dependencies [eddc1517]
  - @bigtest/suite@0.10.0
  - @bigtest/globals@0.7.1

## 0.16.1

### Patch Changes

- Updated dependencies [4b54d9f9]
  - @bigtest/project@0.11.0
  - @bigtest/bundler@0.10.2

## 0.16.0

### Minor Changes

- 248d6ddc: produce coverage reports by passing the `--coverage` option to the
  `test` and `ci` commands

### Patch Changes

- Updated dependencies [248d6ddc]
- Updated dependencies [4486733a]
- Updated dependencies [f51c9933]
  - @bigtest/project@0.10.0
  - @bigtest/agent@0.14.0
  - @bigtest/atom@0.10.0
  - @bigtest/bundler@0.10.1
  - @bigtest/webdriver@0.6.3

## 0.15.0

### Minor Changes

- c5952202: Don't watch test files when running CI command
- abc69ff6: Filter test run by file path
- 934cfa72: Fail test run if there are errors in the test files

### Patch Changes

- f1846f07: Prevent race conditions in result stream by always streaming results even if the test run is already complete.
- 22145f61: Start orchestrator even if bundle has errors.
- Updated dependencies [c5952202]
- Updated dependencies [d97038a8]
- Updated dependencies [c7bed38b]
- Updated dependencies [abc69ff6]
- Updated dependencies [dcc12ea2]
- Updated dependencies [7a727c86]
- Updated dependencies [eae589f0]
  - @bigtest/bundler@0.10.0
  - @bigtest/project@0.9.0
  - @bigtest/globals@0.7.0
  - @bigtest/suite@0.9.0
  - @bigtest/agent@0.13.0
  - @bigtest/atom@0.9.0
  - @bigtest/webdriver@0.6.2

## 0.14.1

### Patch Changes

- 8449c220: Don't spam the console when build errors happen
- Updated dependencies [f1ed2b61]
  - @bigtest/agent@0.12.0

## 0.14.0

### Minor Changes

- 0da756c5: Improve CLI output and enable swappable formatters

### Patch Changes

- Updated dependencies [f803d9ed]
  - @bigtest/agent@0.11.0

## 0.13.0

### Minor Changes

- 375ec663: Track console messages and uncaught errors and make them available via the API

### Patch Changes

- Updated dependencies [375ec663]
  - @bigtest/agent@0.10.0
  - @bigtest/suite@0.8.0
  - @bigtest/globals@0.6.3

## 0.12.0

### Minor Changes

- 837a4630: Remove Mailbox based API from effection-express and use agent handler in server

### Patch Changes

- 804210f6: Upgraded @effection/subscription and applied new chainability
- 83a68db6: Fix path issues on windows in the manifest generator.
- Updated dependencies [804210f6]
- Updated dependencies [ffd9be8b]
- Updated dependencies [837a4630]
- Updated dependencies [b5ec3cb6]
- Updated dependencies [150f131b]
- Updated dependencies [4012b814]
- Updated dependencies [0604464c]
  - @bigtest/agent@0.9.0
  - @bigtest/atom@0.8.2
  - @bigtest/bundler@0.9.0
  - @bigtest/client@0.3.0
  - @bigtest/effection@0.5.4
  - @bigtest/effection-express@0.8.0
  - @bigtest/suite@0.7.0
  - @bigtest/project@0.8.0
  - @bigtest/globals@0.6.2

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
