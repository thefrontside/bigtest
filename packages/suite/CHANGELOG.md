# Changelog

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
