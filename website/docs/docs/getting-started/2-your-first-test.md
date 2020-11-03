---
id: your-first-test
title: Writing your first test
---

To demonstrate how you can write tests, let's install the TodoMVC app from BigTest:
```
$ yarn add -D @bigtest/todomvc
```

Assuming you went with the default settings for `bigtest.json`, the app command will be configured as `yarn start` as such:
```json
{
  "app": {
    "command": "yarn start",
    "url": "http://localhost:3000"
  }
}
```
Then go into your `package.json` file and modify the start script as `yarn bigtest-todomvc 3000`:
```json
{
  "scripts": {
    "start": "yarn bigtest-todomvc 3000"
  }
}
```
Finally, let's go into the `test/` directory and create `todomvc.test.ts`:
```js
import { Heading, Page, test } from `bigtest`;

export default test('bigtest todomvc')
  .step(Page.visit('/'))
  .assertion(Heading('todos').exists());
```

That's it! Now you can run `yarn bigtest ci` and you should see one passing step and one passing assertion.

_The `bigtest ci` command is meant to run in your CI workflow. It starts your app, the BigTest server, runs the tests, and closes everything on its own. The alternative is to start the server manually and then run another command to trigger the tests which is more helpful when you need to debug your app. You can find out more in the [development-workflow] section._

In the next section we'll be explaining what [interactors] are.
