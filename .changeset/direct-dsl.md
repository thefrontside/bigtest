---
"@bigtest/suite": minor
"@bigtest/interactor": minor
---
Allow passing any fully-formed step into the `step()` method of the
DSL. For example:
```ts
.step({ description: 'visit /users', action: () => App.visit('/users')})
```
Interactions implement this natively, so you can now use them
directly:

```ts
.step(App.visit('/users'))
```
