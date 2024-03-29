# @bigtest/bundler

## 0.16.1

### Patch Changes

- 2dab416f: Add @rollup/plugin-json

## 0.16.0

### Minor Changes

- 76b165a0: Minor bump everything to fix version issues

### Patch Changes

- Updated dependencies [76b165a0]
  - @bigtest/project@0.18.0

## 0.15.1

### Patch Changes

- 39617776: Remove dependency on @bigtest/effection
- 03984b25: Upgrade to Effection 2.0.1
- 8b748748: Use duplex channel from @effection/duplex-channel
- 62320b87: upgrade @frontside/eslint-config and, @frontside/typescript packages
- Updated dependencies [03984b25]
- Updated dependencies [62320b87]
  - @bigtest/project@0.17.1

## 0.15.0

### Minor Changes

- 11925e0e: Upgrade effection to beta.21

### Patch Changes

- Updated dependencies [11925e0e]
  - @bigtest/effection@0.9.0
  - @bigtest/project@0.17.0

## 0.14.1

### Patch Changes

- feaa260b: Add homepage links to packages
- Updated dependencies [9682c92d]
- Updated dependencies [feaa260b]
  - @bigtest/effection@0.8.0
  - @bigtest/project@0.16.1

## 0.14.0

### Minor Changes

- 08b9cd32: Upgrade to Effection v2 beta

### Patch Changes

- Updated dependencies [08b9cd32]
  - @bigtest/effection@0.7.0
  - @bigtest/project@0.16.0

## 0.13.1

### Patch Changes

- 264fafcb: pin effection packages in bundler
- Updated dependencies [ec952b70]
  - @bigtest/project@0.15.3

## 0.13.0

### Minor Changes

- 7d5e7d5b: add a jsTSConfig to the rollup typescript plugin if no tsconfig is found

## 0.12.5

### Patch Changes

- 4762d0d9: Update effection dependencies to v1
- Updated dependencies [4762d0d9]
  - @bigtest/effection@0.6.3
  - @bigtest/project@0.15.2

## 0.12.4

### Patch Changes

- 08b07d78: Update effection to 0.8.0 and update subpackages
- Updated dependencies [08b07d78]
  - @bigtest/effection@0.6.2
  - @bigtest/project@0.15.1

## 0.12.3

### Patch Changes

- Updated dependencies [d28b494f]
  - @bigtest/project@0.15.0

## 0.12.2

### Patch Changes

- Updated dependencies [d0097929]
  - @bigtest/project@0.14.0

## 0.12.1

### Patch Changes

- 4d7c43f9: enable eslint rules from the latest @typescript-eslint/recommended
- d85e5e95: upgrade eslint, typescript and @frontside packages
- Updated dependencies [4d7c43f9]
- Updated dependencies [d85e5e95]
  - @bigtest/effection@0.6.1
  - @bigtest/project@0.13.1

## 0.12.0

### Minor Changes

- c052e7e2: upgrade bundler dependencies mainly to get type definitions for @rollup/plugin-babel

### Patch Changes

- c2c4bd11: Upgrade @frontside/typescript to v1.1.0
- 41018eaf: move commonjs down the rollup plugin order
- Updated dependencies [ee797ddf]
- Updated dependencies [c2c4bd11]
- Updated dependencies [2603129b]
- Updated dependencies [6af43e28]
- Updated dependencies [ee797ddf]
  - @bigtest/effection@0.6.0
  - @bigtest/project@0.13.0

## 0.11.0

### Minor Changes

- e5606e61: Fail build on TypeScript errors and add support for tsconfig file

### Patch Changes

- Updated dependencies [e5606e61]
  - @bigtest/project@0.12.0

## 0.10.2

### Patch Changes

- Updated dependencies [4b54d9f9]
  - @bigtest/project@0.11.0

## 0.10.1

### Patch Changes

- Updated dependencies [248d6ddc]
  - @bigtest/project@0.10.0

## 0.10.0

### Minor Changes

- c5952202: Don't watch test files when running CI command

### Patch Changes

- Updated dependencies [c5952202]
  - @bigtest/project@0.9.0

## 0.9.0

### Minor Changes

- 150f131b: pass bundle and not array of bundles from manifest-builder to bundler
- 4012b814: pass unwrapped bundle from manifest-builder to bundler

### Patch Changes

- 804210f6: Upgraded @effection/subscription and applied new chainability
- Updated dependencies [804210f6]
- Updated dependencies [b5ec3cb6]
  - @bigtest/effection@0.5.4
  - @bigtest/project@0.8.0

## 0.8.1

### Patch Changes

- 83153e3f: Upgrade effection dependencies to latest versions, upgrade to new style of subscriptions
- Updated dependencies [1ea83ac4]
- Updated dependencies [83153e3f]
  - @bigtest/project@0.7.0
  - @bigtest/effection@0.5.3

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
