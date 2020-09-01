---
"@bigtest/suite": minor
---
Objects that are promises and also have a 'description' property can
be used in the dsl as steps and assertions directly. This includes all
interactions.

before:

```ts
step("visit the /users route", async () => App.visit("/users")
```

after:

```ts
step(App.visit("/users"))
```
