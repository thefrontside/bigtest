---
id: writing-your-first-test
title: Writing Your First Test
---

## Writing Your First Test
After you've run `yarn bigtest init`, your `bigtest.json` file should look something like this:
```json
{
  "port": 24000,
  "launch": [
    "chrome.headless"
  ],
  "app": {
    "command": "npm start",
    "env": {
      "PORT": 3000
    },
    "url": "http://localhost:3000"
  },
  "testFiles": [
    "test/**/*.test.{ts,js}"
  ]
}
```

Let's say we're testing a todomvc app. As per the `testFiles` property in the `bigtest.json` file, you would create your tests inside the `./test/` directory:

```js
import { Button, CheckBox, Heading, Page, test } from `bigtest`;

export default test('bigtest todomvc')
  .step(Page.visit('/'))
  .assertion(Heading('todos').exists())
  .child('create todo', test => test
    .step(
      TextField().fillIn('buy groceries'),
      Button('Add').click())
    .assertion(CheckBox('buy groceries').exists())
  );
```

Some things to know:
- Steps will always run before assertions
- Children will run in parallel on their own branch
- Learn more about how interactors work in our [Interactors](/interactors) docs
