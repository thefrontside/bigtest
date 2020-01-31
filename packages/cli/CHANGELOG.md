# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Changed

- the `--serve` plugin now automatically sets `NODE_ENV` environment variable to "test" instead of "testing"

## [0.2.2] - 2018-09-26

### Fixed

- fixed `bigtest.opts` init template to use dash-cased options instead
  of dot notation. See [#20](https://github.com/bigtestjs/cli/pull/20) for more.

## [0.2.1] - 2018-09-14

### Changed

- `client-host` and `proxy-host` to `client-hostname` and
  `proxy-hostname`.

## [0.2.0] - 2018-09-14

### Changed

- dot-notation CLI options to be dash-cased
