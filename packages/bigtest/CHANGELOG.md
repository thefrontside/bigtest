# bigtest

## 0.4.0

### Minor Changes

- d12bbe7e: Add RadioButton interactor
- 09a28c69: TextField interactor now also matches textarea elements
- 64c8b12f: Rename App interactor to Page and deprecate App interactor
- 9b2749b0: Handle duplicates in step descriptions
- 95698ac3: Page interactor can filter by title/url
- 8731eda0: Redirects to absolute URLs are handled automatically by proxy server

### Patch Changes

- afd5bcf5: server websocket handlers can now explicitly handle socket exit codes
- Updated dependencies [d12bbe7e]
- Updated dependencies [09a28c69]
- Updated dependencies [64c8b12f]
- Updated dependencies [95698ac3]
- Updated dependencies [d5fa391e]
  - @bigtest/interactor@0.20.0
  - @bigtest/cli@0.15.1

## 0.3.0

### Minor Changes

- 98f99ba3: Add CheckBox interactor
- 2b6f0108: Print log output when running with --show-log
- 0dfb3828: Interactor methds exists() and absent() are better behaved when it comes to ambiguity
- 3a9ff582: TextField interactor matches any input which is not a special input
- e5606e61: Fail build on TypeScript errors and add support for tsconfig file
- 37cd06be: Validate manifest, check duplicate tests and nesting depth

### Patch Changes

- eff8120f: Don't watch test files in manifest generator if watchTestFiles is false
- fe71c944: Use new @effection/node process api internally
- ca1cba60: Workaround the fact that React > 15.6 monkey-patches the
  HTMLInputElement `value` property as an optimization causing the
  `fillIn()` action not to work. See
  https://github.com/thefrontside/bigtest/issues/596
- a225fcda: Improve rendering of error table in interactors
- ad2ea478: Don't crash server when manifest cannot be imported
- Updated dependencies [98f99ba3]
- Updated dependencies [fe71c944]
- Updated dependencies [2b6f0108]
- Updated dependencies [ca1cba60]
- Updated dependencies [a225fcda]
- Updated dependencies [0dfb3828]
- Updated dependencies [3a9ff582]
- Updated dependencies [e5606e61]
- Updated dependencies [00b424db]
- Updated dependencies [37cd06be]
  - @bigtest/interactor@0.19.0
  - @bigtest/cli@0.15.0
  - @bigtest/suite@0.11.0

## 0.2.2

### Patch Changes

- cdf3ee9a: Improve formatting of stack traces
- Updated dependencies [e6cdf046]
- Updated dependencies [215f72ae]
- Updated dependencies [215f72ae]
- Updated dependencies [54707a71]
- Updated dependencies [215f72ae]
- Updated dependencies [215f72ae]
- Updated dependencies [cdf3ee9a]
- Updated dependencies [eddc1517]
- Updated dependencies [215f72ae]
  - @bigtest/interactor@0.18.0
  - @bigtest/cli@0.14.1
  - @bigtest/suite@0.10.0

## 0.2.1

### Patch Changes

- Updated dependencies [4b54d9f9]
  - @bigtest/cli@0.14.0

## 0.2.0

### Minor Changes

- 6290d711: Reexport @bigtest/interactor and @bigtest/suite from bigtest package

### Patch Changes

- Updated dependencies [248d6ddc]
  - @bigtest/cli@0.13.0

## 0.1.5

### Patch Changes

- Updated dependencies [c5952202]
- Updated dependencies [ee45f0bd]
- Updated dependencies [5d1a0806]
- Updated dependencies [abc69ff6]
- Updated dependencies [fbc7b237]
- Updated dependencies [1e643719]
- Updated dependencies [934cfa72]
  - @bigtest/cli@0.12.0

## 0.1.4

### Patch Changes

- Updated dependencies [0da756c5]
  - @bigtest/cli@0.11.0

## 0.1.3

### Patch Changes

- Updated dependencies [375ec663]
  - @bigtest/cli@0.10.0

## 0.1.2

### Patch Changes

- 604b4dce: Add license to package
- Updated dependencies [804210f6]
- Updated dependencies [b5ec3cb6]
- Updated dependencies [969532b6]
- Updated dependencies [b5ec3cb6]
- Updated dependencies [fb882344]
  - @bigtest/cli@0.9.0

## 0.1.1

### Patch Changes

- Updated dependencies [1ea83ac4]
- Updated dependencies [46bee8bc]
- Updated dependencies [62252502]
- Updated dependencies [d4e7046c]
- Updated dependencies [83153e3f]
  - @bigtest/cli@0.8.0

## 0.1.0

### Minor Changes

- e8a25561: Initial publish

### Patch Changes

- Updated dependencies [e950715a]
  - @bigtest/cli@0.7.3
