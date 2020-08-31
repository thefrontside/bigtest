# @bigtest/bundler

## 0.8.0

### Minor Changes

- 3be69744: Create a bunlder state and use the atom to broadcast error info.

### Patch Changes

- Updated dependencies [3be69744]
- Updated dependencies [e950715a]
  - @bigtest/project@0.6.0
  - @bigtest/effection@0.5.2

## 0.7.0

### Minor Changes

- 80d68ef0: set process.env.NODE_ENV='production' inside the test bundle. This
  will ensure that 3rd party packages that depend on this will continue
  to function

## 0.6.1

### Patch Changes

- 7063bce3: The `try`/`finally` in `Bundler` was not wrapping the code that it should have; fix this by wrapping more.
- 7063bce3: Properly ignore `node_modules` from `Bundler` file watcher.

## 0.6.0

### Minor Changes

- 6bd0e8a5: Refactor the manifest builder to use Rollup instead of Parcel.
