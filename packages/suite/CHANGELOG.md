# Changelog

## 0.12.1

### Patch Changes

- feaa260b: Add homepage links to packages

## 0.12.0

### Minor Changes

- 08b9cd32: Upgrade to Effection v2 beta

## 0.11.3

### Patch Changes

- 0dacf302: validate test implementation instances in `validate-test`.

## 0.11.2

### Patch Changes

- 4d7c43f9: enable eslint rules from the latest @typescript-eslint/recommended
- d85e5e95: upgrade eslint, typescript and @frontside packages

## 0.11.1

### Patch Changes

- 33a64ac0: Enforce order ot steps, assertion and children in DSL
- c2c4bd11: Upgrade @frontside/typescript to v1.1.0

## 0.11.0

### Minor Changes

- 37cd06be: Validate manifest, check duplicate tests and nesting depth

## 0.10.0

### Minor Changes

- eddc1517: Adds ability to add multiple steps in a single go with the dsl:
  ```js
  test("multi-step").step(
    App.visit("/users/preview/1"),
    Button("Fees/fines").click(),
    Link("Create fee/fine").click(),
    Select("Fee/fine owner*").select("testOwner"),
    Select("Fee/fine type*").select("testFineType")
  );
  ```

## 0.9.0

### Minor Changes

- c7bed38b: Allow step actions and assertion checks to return values synchronously
- abc69ff6: Filter test run by file path

## 0.8.0

### Minor Changes

- 375ec663: Track console messages and uncaught errors and make them available via the API

## 0.7.0

### Minor Changes

- ffd9be8b: Allow passing any fully-formed step into the `step()` method of the
  DSL. For example:

  ```ts
  .step({ description: 'visit /users', action: () => App.visit('/users')})
  ```

  Interactions implement this natively, so you can now use them
  directly:

  ```ts
  .step(App.visit('/users'))
  ```

## 0.6.0

### Minor Changes

- d4e7046c: Resolve source maps in error stack traces for better debugging

## 0.5.3

### Patch Changes

- e950715a: Add missing typescript dev dependency to eliminate yarn warnings. Also, upgraded typescript to 3.9.7 to make it consistent.

## 0.5.2

### Patch Changes

- ae576595: distribute typescript sources so that bundlers like parcl can have
  access to them

## 0.5.1

### Patch Changes

- d2d50a5b: upgrade effection

## 0.5.0

### Minor Changes

- 154b93a1: Introduce changesets for simpler release management
  All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.1] - 2020-05-13

### Added

- test suite DSL
