# @bigtest/project

## 0.15.1

### Patch Changes

- 08b07d78: Update effection to 0.8.0 and update subpackages
- Updated dependencies [08b07d78]
  - @bigtest/driver@0.5.6

## 0.15.0

### Minor Changes

- d28b494f: Add edge and edge.headless drivers by default

## 0.14.0

### Minor Changes

- d0097929: Add support for edge on windows and use it as the default driver

## 0.13.1

### Patch Changes

- 4d7c43f9: enable eslint rules from the latest @typescript-eslint/recommended
- d85e5e95: upgrade eslint, typescript and @frontside packages
- Updated dependencies [d85e5e95]
  - @bigtest/driver@0.5.5

## 0.13.0

### Minor Changes

- 2603129b: support spawning agents from an unmanaged webdriver
- 6af43e28: refactor ProxyServer to Service

### Patch Changes

- c2c4bd11: Upgrade @frontside/typescript to v1.1.0
- Updated dependencies [c2c4bd11]
  - @bigtest/driver@0.5.4

## 0.12.0

### Minor Changes

- e5606e61: Fail build on TypeScript errors and add support for tsconfig file

## 0.11.0

### Minor Changes

- 4b54d9f9: Add an interactive `init` command

## 0.10.0

### Minor Changes

- 248d6ddc: produce coverage reports by passing the `--coverage` option to the
  `test` and `ci` commands

## 0.9.0

### Minor Changes

- c5952202: Don't watch test files when running CI command

## 0.8.0

### Minor Changes

- b5ec3cb6: Remove default app and `--no-app.command` option. If no app is provided, none will be launched.

## 0.7.0

### Minor Changes

- 1ea83ac4: Add ability to load app from any url, not just a locally managed server

## 0.6.0

### Minor Changes

- 3be69744: Create a bunlder state and use the atom to broadcast error info.

### Patch Changes

- Updated dependencies [e950715a]
  - @bigtest/driver@0.5.3

## 0.5.1

### Patch Changes

- d2d50a5b: upgrade effection
- Updated dependencies [d2d50a5b]
  - @bigtest/driver@0.5.1

## 0.5.0

### Minor Changes

- 358e07ab: `@bigtest/project` used to have a peer dependency on
  `@bigtest/webdriver` in order to import some interfaces. We maybe
  shouldn't have used peer dependency in the first place, but now that
  the interfaces have been extracted into `@bigtest/driver` we move the
  dependency there.
- 154b93a1: Introduce changesets for simpler release management

### Patch Changes

- Updated dependencies [154b93a1]
  - @bigtest/driver@0.5.0
