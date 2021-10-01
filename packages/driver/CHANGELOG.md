# @bigtest/driver

## 0.7.0

### Minor Changes

- 11925e0e: Upgrade effection to beta.21

## 0.6.1

### Patch Changes

- feaa260b: Add homepage links to packages

## 0.6.0

### Minor Changes

- 08b9cd32: Upgrade to Effection v2 beta

## 0.5.7

### Patch Changes

- 4762d0d9: Update effection dependencies to v1

## 0.5.6

### Patch Changes

- 08b07d78: Update effection to 0.8.0 and update subpackages

## 0.5.5

### Patch Changes

- d85e5e95: upgrade eslint, typescript and @frontside packages

## 0.5.4

### Patch Changes

- c2c4bd11: Upgrade @frontside/typescript to v1.1.0

## 0.5.3

### Patch Changes

- e950715a: Add missing typescript dev dependency to eliminate yarn warnings. Also, upgraded typescript to 3.9.7 to make it consistent.

## 0.5.2

### Patch Changes

- 2c54420b: Upgraded version of lodash to 4.17.19 to address the following security notice.

  GHSA-p6mc-m468-83gw
  low severity
  Vulnerable versions: < 4.17.19
  Patched version: 4.17.19

  Versions of lodash prior to 4.17.19 are vulnerable to Prototype Pollution. The function zipObjectDeep allows a malicious user to modify the prototype of Object if the property identifiers are user-supplied. Being affected by this issue requires zipping objects based on user-provided property arrays.

  This vulnerability causes the addition or modification of an existing property that will exist on all objects and may lead to Denial of Service or Code Execution under specific circumstances.

## 0.5.1

### Patch Changes

- d2d50a5b: upgrade effection

## 0.5.0

### Minor Changes

- 154b93a1: Introduce changesets for simpler release management
