# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

## [Unreleased]

## [1.1.2] - 2019-10-21

### Changed

- Upgrade mocha and other dependencies in order to avoid github
  security warnings.
    - https://github.com/bigtestjs/convergence/pull/29
    - https://github.com/bigtestjs/convergence/pull/28
- Transition to automated transparent publishing via GitHub
  actions. https://github.com/bigtestjs/convergence/pull/27

## [1.1.1] - 2018-10-23

### Fixed

- global Date reference which caused date & time mocking to break
  convergences

## [1.1.0] - 2018-10-04

### Added

- queued functions retain the previous value when returning undefined

### Changed

- trailing `always` assertions on Convergence instances default to
  remaining time instead of always using remaining time

## [1.0.0] - 2018-09-13

### Changed

- immediately throw when encountering an async assertion
- `when` and `always` helpers return thennable functions that can be
  used as callbacks, or awaited on directly
- updated to stable dependencies

### Removed

- deprecated `once` method
- Typescript types

## [0.10.0] - 2018-07-05

### Added

- error when using async functions or returning promises with
  convergent assertions

## [0.9.1] - 2018-05-05

### Changed

- internal docs links
- update `@bigtest/meta`

## [0.9.0] - 2018-05-05

### Changed

- "stack" terminology to "queue" to better reflect first-in-first-out

### Added

- `when` and `always` helpers to immediately start converging on a
single assertion without the need for creating a `Convergence`

### Removed

- `convergeOn` export in favor of `when` and `always`

## [0.8.0] - 2018-04-30

### Added

- transpiled es module bundle
- typescript definitions

### Changed

- `_timeout` to `timeout` when providing an options hash to the
convergence constructor

## [0.7.0] - 2018-04-07

### Added

- `docs` script to generate documentation
- `.when()` to replace the `.once()` method

### Changed

- updated inline api docs
- `Convergence` assertions retain the instance context

### Deprecated

- `.once()` in favor of `.when()`

### Removed

- context currying from `convergeOn`

## [0.6.0] - 2018-03-16

### Added

- then method to support async / await syntax without calling `.run()`

### Fixed

- `.append()` method to use `isConvergence` instead of `instanceof`

## [0.5.0] - 2018-03-14

### Added

- full support for returning promises in `.do()` blocks
- timeout error thrown when convergence exceeds timeout
- support for returning convergence in `.do()` blocks
- `isConvergence` helper function

## [0.4.0] - 2018-03-02

### Changed

- convergent assertions no longer attempt to resolve or reject before
their timeout

## [0.3.0] - 2018-02-18

### Added

- ability to extend the convergence class

### Changed

- convergence constructor to be more general to allow subclasses to
handle their own construction

## [0.2.0] - 2018-02-16

### Added

- `.append()` method to combine convergences together

- "module" entry point to support native consumption of @bigtest/mocha
as es module

### Fixed

- correctly remove comments from compiled files
