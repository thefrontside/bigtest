# @bigtest/bundler

## 0.6.1

### Patch Changes

- 7063bce3: The `try`/`finally` in `Bundler` was not wrapping the code that it should have; fix this by wrapping more.
- 7063bce3: Properly ignore `node_modules` from `Bundler` file watcher.

## 0.6.0

### Minor Changes

- 6bd0e8a5: Refactor the manifest builder to use Rollup instead of Parcel.
