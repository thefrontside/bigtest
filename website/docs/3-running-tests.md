---
id: running-tests
title: Running Tests
---

There are two ways you can run your tests in BigTest, `bigtest ci` and `bigtest test`, which each have different use cases. 

## bigtest ci

The `bigtest ci` command is meant to run in your CI workflow.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  groupId="package-manager"
  defaultValue="npm"
  values={[
    {label: 'NPM', value: 'npm'},
    {label: 'Yarn', value: 'yarn'}
  ]}>
  <TabItem value="npm">

  ```
  npx bigtest ci
  ```

  </TabItem>
  <TabItem value="yarn">

  ```
  yarn bigtest ci
  ```

  </TabItem>
</Tabs>

This command starts your app and the BigTest server, then runs the tests and closes everything down on its own. This command can also be used locally when you don't feel the need to debug your app and you just want to run the tests to see if there are any failing tests.

## bigtest test

`bigtest test` is great for debugging your app locally.

What is different about this mode? Unlike `ci` mode, you can see the app as your tests run. This is sometimes referred to as "non-headless" mode for tests.
The browser also stays open after tests are running so that you can inspect and interact with your app.

First, start the server with this command:

<Tabs
  groupId="package-manager"
  defaultValue="npm"
  values={[
    {label: 'NPM', value: 'npm'},
    {label: 'Yarn', value: 'yarn'}
  ]}>
  <TabItem value="npm">

  ```
  npx bigtest server --launch=chrome
  ```

  </TabItem>
  <TabItem value="yarn">

  ```
  yarn bigtest server --launch=chrome
  ```

  </TabItem>
</Tabs>

Once the server is running, run this command in a separate terminal:

<Tabs
  groupId="package-manager"
  defaultValue="npm"
  values={[
    {label: 'NPM', value: 'npm'},
    {label: 'Yarn', value: 'yarn'}
  ]}>
  <TabItem value="npm">

  ```
  npx bigtest test
  ```

  </TabItem>
  <TabItem value="yarn">

  ```
  yarn bigtest test
  ```

  </TabItem>
</Tabs>

Now you should see your tests running!

> You can also modify your `bigtest.json` file to start the server in a non-headless browser but then you'll need to remember to revert it to headless if you plan on running BigTest in your CI. And for that reason, we just recommend using the `--launch` flag instead as shown above.

## Parallel Testing

BigTest allows you to simultaneously run your tests in multiple browsers. You may have noticed that the `launch` property of your `bigtest.json` file is an array. In order to set up parallel testing, you just need to add additional browsers to that list:

```json
{
  "launch": [
    "chrome.headless",
    "firefox.headless"
  ],
  "app": {...},
  "testFiles: [...]
}
```

The configuration shown above will run your tests in both Chrome and Firefox in headless modes.

## Next steps

Now you are ready to write more complex tests, or create tests for more views in your app.

The main way to test user interaction flows and make assertions is using Interactors. Follow the [Interactors Guides](https://frontside.com/interactors) to learn how to use built-in interactors or write your own.

Please feel free to reach out to us in [the Discord chat](https://discord.gg/r6AvtnU) if you have any questions or feedback.
