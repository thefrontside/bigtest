# Changelog

## 0.6.0

### Minor Changes

- ee797ddf: Add DuplexChannel, a bidirectional channel
- ee797ddf: Add `Mailbox.from` to create a mailbox from a subscribable

### Patch Changes

- c2c4bd11: Upgrade @frontside/typescript to v1.1.0

## 0.5.4

### Patch Changes

- 804210f6: Upgraded @effection/subscription and applied new chainability

## 0.5.3

### Patch Changes

- 83153e3f: Upgrade effection dependencies to latest versions, upgrade to new style of subscriptions

## 0.5.2

### Patch Changes

- e950715a: Add missing typescript dev dependency to eliminate yarn warnings. Also, upgraded typescript to 3.9.7 to make it consistent.

## 0.5.1

### Patch Changes

- d2d50a5b: upgrade effection

## 0.5.0

### Minor Changes

- 154b93a1: Introduce changesets for simpler release management

### Patch Changes

- e10b9c52: upgrade mailbox implementation to use `@effection/subscription` apis,
  rather than the one-off internal event emitter subscription
  All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2020-04-01

### Added

- Mailbox API for never missing an event (https://github.com/thefrontside/bigtest/pull/188)
