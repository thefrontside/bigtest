# @bigtest/interactor

## 0.12.0

### Minor Changes

- d62c4e2b: Add an app interactor which can be used to load the application into the test frame. Agent no longer loads app automatically.
- caddd0cb: Use @bigtest/globals for configuration, rather than own configuration mechanism.
- 2de1a7ab: Interactors are generically typed over the specification that they use.

### Patch Changes

- d1725678: Interactors did not properly type the defined interactors due to incorrectly applied type transformations.
- Updated dependencies [d62c4e2b]
- Updated dependencies [65b0156c]
  - @bigtest/globals@0.6.0

## 0.11.2

### Patch Changes

- f2ca496e: use @bigtest/performance to ponyfill performance apis
- 6b6c7450: bundle sources so that parcel can use them to generate bundle
  sourcemaps

## 0.11.1

### Patch Changes

- d2d50a5b: upgrade effection

## 0.11.0

### Minor Changes

- 154b93a1: Introduce changesets for simpler release management
