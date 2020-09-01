# @bigtest/project

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
