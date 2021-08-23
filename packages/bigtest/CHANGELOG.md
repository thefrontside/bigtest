# bigtest

## 0.14.4

### Patch Changes

- 4f6d6e1e: Update @bigtest/interactor dependencies to @interactors/html

## 0.14.3

### Patch Changes

- Updated dependencies [0bf23644]
  - @bigtest/interactor@0.31.1

## 0.14.2

### Patch Changes

- Updated dependencies [7089b975]
  - @bigtest/interactor@0.31.0

## 0.14.1

### Patch Changes

- Updated dependencies [03cfbb11]
- Updated dependencies [3dc81a09]
- Updated dependencies [5159aa40]
  - @bigtest/interactor@0.30.0

## 0.14.0

### Minor Changes

- e1395f56: Allow options to be cleared by providing an empty string

### Patch Changes

- Updated dependencies [448c034d]
- Updated dependencies [6d69281a]
- Updated dependencies [0664aa51]
- Updated dependencies [e1395f56]
- Updated dependencies [4762d0d9]
  - @bigtest/interactor@0.29.0
  - @bigtest/cli@0.19.0

## 0.13.3

### Patch Changes

- 7228fc96: update chromedriver version to be compatible with latest version of chrome.

## 0.13.2

### Patch Changes

- eae849da: Improved format for filter not matching error
- 08b07d78: Update effection to 0.8.0 and update subpackages
- 22903431: Prevent race condition if app server becomes available too early
- Updated dependencies [eae849da]
- Updated dependencies [08b07d78]
- Updated dependencies [d801d1f6]
  - @bigtest/interactor@0.28.2
  - @bigtest/cli@0.18.2

## 0.13.1

### Patch Changes

- 0ef3571e: Fix the `text` filter and `innerText` based locators so that they work
  out of the box with JSDOM
- Updated dependencies [0ef3571e]
  - @bigtest/interactor@0.28.1

## 0.13.0

### Minor Changes

- a3d27f06: Use innerText for html interactors instead of textContent

### Patch Changes

- Updated dependencies [a3d27f06]
  - @bigtest/interactor@0.28.0

## 0.12.0

### Minor Changes

- 1e22a72e: Deprecate focus, blur and focused helpers
- d12f2e6e: Add text, className and classList filters to html interactor

### Patch Changes

- Updated dependencies [1e22a72e]
- Updated dependencies [d12f2e6e]
  - @bigtest/interactor@0.27.0

## 0.11.0

### Minor Changes

- d28b494f: Add edge and edge.headless drivers by default
- c19de909: Don't wait for manifest builder to start orchestrator

### Patch Changes

- 1da4bcfd: Fix path discovery of Safari driver
- Updated dependencies [0dacf302]
  - @bigtest/suite@0.11.3
  - @bigtest/cli@0.18.1

## 0.10.0

### Minor Changes

- a1d66276: Add built in matchers: includes, matches, and, or, not
- d0097929: Add support for edge on windows and use it as the default driver

### Patch Changes

- Updated dependencies [a1d66276]
- Updated dependencies [d0097929]
  - @bigtest/interactor@0.26.0
  - @bigtest/cli@0.18.0

## 0.9.0

### Minor Changes

- ad8e7468: Add HTML and FormField base interactors

### Patch Changes

- 67681235: Add `changeOrigin` flag to proxy server so that app urls served over SSL will work properly
- Updated dependencies [ad8e7468]
  - @bigtest/interactor@0.25.0

## 0.8.0

### Minor Changes

- d39028e2: implement typescript project references in all packages that have a compiled output
- 42931105: Add `extend` method to interactor builder API, to downcast to a subtype of the element
- ea04c546: Deprecate the `perform` function, use pattern matching instead!
- 052bf8f3: Add builder API for creating interactors
- ee5bf789: Add matchers to interactors, for more flexible matching

### Patch Changes

- d85e5e95: upgrade eslint, typescript and @frontside packages
- Updated dependencies [74f4b33c]
- Updated dependencies [4d7c43f9]
- Updated dependencies [06f915b0]
- Updated dependencies [42931105]
- Updated dependencies [0aed40e9]
- Updated dependencies [ea04c546]
- Updated dependencies [052bf8f3]
- Updated dependencies [d85e5e95]
- Updated dependencies [ee5bf789]
  - @bigtest/cli@0.17.0
  - @bigtest/interactor@0.24.0
  - @bigtest/suite@0.11.2

## 0.7.0

### Minor Changes

- 98c94312: `perform` will throw an error if run inside an assertion context
- 98c94312: Add `assertion` method to `Interactor`

### Patch Changes

- 1840b2fd: use only slice functions in createAtom
- 25633b44: replace ramda lens with monocle-ts lens
- Updated dependencies [98c94312]
- Updated dependencies [98c94312]
- Updated dependencies [c1dd9d83]
  - @bigtest/interactor@0.23.0
  - @bigtest/cli@0.16.2

## 0.6.1

### Patch Changes

- 15015975: Fix broken CLI package distributions
- Updated dependencies [15015975]
  - @bigtest/cli@0.16.1

## 0.6.0

### Minor Changes

- 70f91954: Interactor actions are not automatically wrapped in a convergence
- 2603129b: support spawning agents from an unmanaged webdriver

### Patch Changes

- 33a64ac0: Enforce order ot steps, assertion and children in DSL
- ada894f4: Fix race condition in chromedriver start
- de93ed83: Change default suggested app port to 3000
- c14b56b4: Upgrade chromedriver and geckodriver versions and loosen their constraints
- c2c4bd11: Upgrade @frontside/typescript to v1.1.0
- dd0ae975: Modify post function in webdriver for firefox
- Updated dependencies [33a64ac0]
- Updated dependencies [4eae24b6]
- Updated dependencies [d7a1ee72]
- Updated dependencies [3bf116f8]
- Updated dependencies [c2c4bd11]
- Updated dependencies [70f91954]
- Updated dependencies [2914cdcb]
- Updated dependencies [85891d0a]
- Updated dependencies [c052e7e2]
  - @bigtest/suite@0.11.1
  - @bigtest/interactor@0.22.0
  - @bigtest/cli@0.16.0

## 0.5.0

### Minor Changes

- bb1234b8: Add Select interactor
- c6e96302: Show app errors on test run if application server exits prematurely
- a986ba26: Add MultiSelect interactor

### Patch Changes

- 4f7edbe1: Add `focused` filter to `Button`, `RadioButton`, `CheckBox`, `Link`,
  and `TextField` interactors
- 1d525656: Add maximul column with for interactor alternative suggestion tables
- 88bcd2c1: When an unexpected error happens in the CLI, catch it, let the user
  know it is our fault, and generate a link to a github issue containing
  diagnostic information
- 393fee75: Throw non-fetch errors when checking reachability, like for example an invalid URL
- Updated dependencies [bb1234b8]
- Updated dependencies [4f7edbe1]
- Updated dependencies [1d525656]
- Updated dependencies [88bcd2c1]
- Updated dependencies [a986ba26]
  - @bigtest/interactor@0.21.0
  - @bigtest/cli@0.15.2

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
