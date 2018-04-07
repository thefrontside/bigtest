# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

## [Unreleased]

## [0.4.0] - 2018-04-07

### Added

- `docs` script to generate documentation
- some default property getters to new `Interactor` instances
- nested interactor methods now return an instance of the topmost
  interactor parent when using the `@interactor` decorator
- `defaultScope` static property

### Changed

- `Interaction` class is now `Interactor`
- `@page` decorator is now `@interactor`
- interaction creator arguments are now ordered with the optional
  selector as the first argument
- the `collection` helper now lazily finds the root for collection
  interactors instead of eagerly doing so
- upgrade `@bigtest/convergence` to `0.7.0`

### Removed

- `PageObject` class

## [0.3.0] - 2018-03-16

### Changed

- upgrade `@bigtest/convergence` to `0.6.0` to support async/await syntax

## [0.2.0] - 2018-03-14

### Changed

- upgrade `@bigtest/convergence` to `0.5.0`

### Fixed

- `isPresent` property returns false when the root does not exist
- `.pause()` methods that halts the convergence when it is encountered
