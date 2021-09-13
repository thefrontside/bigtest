---
id: writing-your-first-test
title: Writing Your First Test
---

After you've run `yarn bigtest init`, you should have a `bigtest.json` file that looks something like this:

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

The `testFiles` property tells BigTest where to look for your testing files and what they are named.

Go ahead and create a `test` directory inside your project and make a new test file, such as `my-first-bigtest.test.js`.

Before you write your own test, let's look at an example. Here is what a test for a To-Do app could look like. It visits the index route of the app, checks to make sure the heading's text has rendered, and adds a task to the list:

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

For your first test, you can start with something small, and then build it up after you see it running successfully. Let's assert that an app's heading text has rendered.

First, look for some text on your app's index page that is wrapped in an `<h1>`.

Then, copy and paste the example below into your own test file, substituting "My Heading Text" in the example below with your own text.

```js
import { Heading, Page, test } from `bigtest`;

export default test('home page rendering')
  .step(Page.visit('/'))
  .assertion(Heading('My Heading Text').exists())
```

If your app does not have any heading text, you could check for a button instead:

```js
import { Button, Page, test } from `bigtest`;

export default test('home page rendering')
  .step(Page.visit('/'))
  .assertion(Button('My Button Text').exists())
```

## Interactors

In the examples above, we used Interactors like `Button` and `Heading` to locate something in the UI, interact with it like a user would, and make a test assertion. Learn more about how interactors work in our [Interactors](https://frontside.com/interactors) guides.

## Test order

If you are familiar with other testing libraries, might have a few questions at this point about testing order. Here is some basic information to help you connect the dots for how BigTest works.

- Steps will always run before assertions
- Children will run in parallel on their own branch

### Next up

In the next section, you will learn how to run the test you just created.
