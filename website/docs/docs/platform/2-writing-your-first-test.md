---
id: writing-your-first-test
title: Writing Your First Test
---

## Writing Your First Test
To demonstrate how you can write tests, let's install the TodoMVC app from BigTest:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="npm"
  values={[
    {label: 'NPM', value: 'npm'},
    {label: 'Yarn', value: 'yarn'}
  ]}>
  <TabItem value="npm">
    <pre><code>$ npm install -D @bigtest/todomvc</code></pre>
  </TabItem>
  <TabItem value="yarn">
    <pre><code>$ yarn add -D @bigtest/todomvc</code></pre>
  </TabItem>
</Tabs>

After you've run `yarn bigtest init`, the default properties of `app.command` and `app.url` inside `bigtest.json` should be:
```json
{
  "app": {
    "command": "yarn start",
    "url": "http://localhost:3000"
  }
}
```
Go into your `package.json` file and modify the start script:
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
