---
"@bigtest/suite": minor
---
Adds ability to add multiple steps in a single go with the dsl:
```js
test("multi-step")
  .step(
    App.visit('/users/preview/1'),
    Button('Fees/fines').click(),
    Link('Create fee/fine').click(),
    Select('Fee/fine owner*').select('testOwner'),
    Select('Fee/fine type*').select('testFineType'));
```
