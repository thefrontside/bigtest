# @bigtest/atom

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
