# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Added

- full support for returning promises in `.do()` blocks
- timeout error thrown when convergence exceeds timeout

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
