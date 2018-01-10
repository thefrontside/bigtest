# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Removed

- `rollup-plugin-commonjs` as it is no longer required to import
  @bigtest/convergence. #22

### Fixed

- correctly remove comments from compiled files

## [0.1.1] - 2018-01-09

### Added

- "module" entry point to support native consumption of @bigtest/mocha
  as es module
