# @bigtest/atom

## 0.10.1

### Patch Changes

- c2c4bd11: Upgrade @frontside/typescript to v1.1.0

## 0.10.0

### Minor Changes

- f51c9933: only publish from atom or slice if the state has changed

## 0.9.0

### Minor Changes

- dcc12ea2: Atom and Slice's `once` never returns undefined. The subscription never terminates, so an undefined value will never happen in practice.

## 0.8.2

### Patch Changes

- 804210f6: Upgraded @effection/subscription and applied new chainability

## 0.8.1

### Patch Changes

- 83153e3f: Upgrade effection dependencies to latest versions, upgrade to new style of subscriptions

## 0.8.0

### Minor Changes

- 3d9d7d64: make Atom#slice and Slice#slice strongly typed and update references.

### Patch Changes

- 1728dda8: add slice overloads into a generic type
- 5f09e43f: type lens in Slice to the provided Ramda type ManualLens instead of any

## 0.7.0

### Minor Changes

- 9ebb822d: Switch to using channel internally. Changes return type of subscription from `void` to `undefined`.
- 9ebb822d: Remove `Atom#each`, use `forEach` instead.
- 9ebb822d: Add `set` method to `Atom`
- 9ebb822d: Add `once` method to `Slice`.

## 0.6.0

### Minor Changes

- e0822c30: Some properties on `Atom` are now private which shouldn't have been public:

  - `initial`
  - `state`
  - `subscriptions`
  - `states`

### Patch Changes

- c3633b37: `once` should check the current state and return immediately if it matches
- dbc25fa3: Can set max listeners on atom
- 6df5d976: Make slice subscribable

## 0.5.1

### Patch Changes

- d2d50a5b: upgrade effection

## 0.5.0

### Minor Changes

- 154b93a1: Introduce changesets for simpler release management
- e407d8dc: Make the atom subscribable so that it can be consumed and transformed
  in a regular fashion.

### Patch Changes

- 1b7fa0f1: upgrade version of @effection/events to 0.7.1
