---
id: quick-start
title: Quick Start
slug: /interactors
---

BigTest's Interactors make your UI tests easier to write, faster, and more reliable. You can use them across many different testing frameworks.

By the end of this quick start, you will be testing one of your own apps with Interactors.

:::note We're here to help
 If you need help or have questions along the way, please let us know in [the Discord chat](https://discord.gg/r6AvtnU) or [open a discussion](https://github.com/thefrontside/bigtest/discussions/) on Github.
:::

## Prerequisites

- [npm](https://www.npmjs.com/get-npm) or [yarn](https://classic.yarnpkg.com/en/docs/install)
- A web app*

*To follow along with this tutorial, you need an app that uses [Jest](https://jestjs.io/), [Cypress](https://www.cypress.io/), or BigTest. For the most interesting learning experience, you should use one of your own apps, or you can use the sample app described below.

### Sample app

If you do not have an app of your own to use with this tutorial, run the following command to install a very simple app that has Jest, Cypress, and BigTest platform pre-installed and configured:

```
$ npx bigtest-sample
```

This command will create a project and output instructions in the console on how you can run tests on any of the three testing platforms. Keep reading to learn about what is inside the sample app!

## Installation

If you're using your own app, install `bigtest` with the following command:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="npm"
  values={[
    {label: 'NPM', value: 'npm'},
    {label: 'Yarn', value: 'yarn'}
]}>
  <TabItem value="npm">

  ```
  $ npm install bigtest --save-dev
  ```

  </TabItem>
  <TabItem value="yarn">

  ```
  $ yarn add bigtest --dev
  ```

  </TabItem>
</Tabs>

:::note Cypress
If you are using Cypress, you will only need to install `@bigtest/cypress`:

<Tabs
  defaultValue="npm"
  values={[
    {label: 'NPM', value: 'npm'},
    {label: 'Yarn', value: 'yarn'}
]}>
  <TabItem value="npm">

  ```
  $ npm install @bigtest/cypress --save-dev
  ```

  </TabItem>
  <TabItem value="yarn">

  ```
  $ yarn add @bigtest/cypress --dev
  ```

  </TabItem>
</Tabs>
:::

## Import Interactors in your test suite

Interactors can do a lot, but let's keep things simple and start with testing one of the most common user interactions - a button click.

In your codebase, find a test that already has a button click in it. In that test, import the `Button` interactor from `bigtest`, and use it to replace the click interaction. Interactors have methods like `click` that mimic user actions.

Click on the tabs below to see some examples within different testing frameworks:

<Tabs
  defaultValue="jest"
  values={[
    {label: 'Jest', value: 'jest'},
    {label: 'Cypress', value: 'cypress'},
    {label: 'BigTest (alpha)', value: 'bigtest'}
]}>
  <TabItem value="jest">

  ```js
  import React from 'react';
  import { render } from '@testing-library/react';
  import App from './App';

  import { Button } from 'bigtest';

  describe('Interactors with Jest', () => {
    beforeEach(() => render(<App />));

    it('clicks button', async () => {
      await Button('Sign In').click();
      // the rest of your test that was already written
    })
  })
  ```

  </TabItem>
  <TabItem value="cypress">

  ```js
  import { Button } from '@bigtest/cypress';

  describe('Interactors with Cypress', () => {
    beforeEach(() => cy.visit('/'));

    it('clicks button', () => {
      cy.do(
        Button('Sign In').click();
      );
      // the rest of your test that was already written
    })
  })
  ```

  </TabItem>
  <TabItem value="bigtest">

  ```js
  import { Button, Page, test } from 'bigtest';

  export default test('BigTest')
    .step(
      Page.visit('/'),
      Button('Sign In').click())
    .assertion(Button('Log out').exists());
  ```

  </TabItem>
</Tabs>

Make sure to substitute "Sign In" with your own button text.

Now, run your tests! Congratulations, you used your first Interactor.

:::note The BigTest Platform
 There's more to BigTest than Interactors. BigTest can also run your tests on any _real_ browser! We have built a new integrated platform from the ground up to help you test more with less effort. And yes, it's free and Open Source too! [Check it out](/platform), and let us know what you think.
:::

## Making test assertions

Interactors have methods to help you make test assertions, like checking if a Button is `absent` or if it `exists`.

In this example, we are testing that the "Sign In" button disappears after a click, and a "Log Out" button appears:

<Tabs
  defaultValue="jest"
  values={[
    {label: 'Jest', value: 'jest'},
    {label: 'Cypress', value: 'cypress'},
    {label: 'BigTest (alpha)', value: 'bigtest'}
]}>
  <TabItem value="jest">

  ```js
  describe('Interactors with Jest', () => {
    beforeEach(() => render(<App />));

    it('clicks button', async () => {
      await Button('Sign In').click();
      await Button('Sign In').absent();
      await Button('Log Out').exists();
    })
  })
  ```

  </TabItem>
  <TabItem value="cypress">

  ```js
  describe('Interactors with Cypress', () => {
    beforeEach(() => cy.visit('/'));

    it('clicks button', () => {
      cy.do(
        Button('Sign In').click()
      );
      cy.expect([
        Button('Sign In').absent(),
        Button('Log Out').exists(),
      ]);
    })
  })
  ```

  </TabItem>
  <TabItem value="bigtest">

  ```js
  import { Button, Page, test } from 'bigtest';

  export default test('BigTest')
    .step(
      Page.visit('/'),
      Button('Sign In').click())
    .assertion(Button('Log out').exists());
  ```

  </TabItem>
</Tabs>

Run your tests. Now you are making an assertion with an interactor!

This small example above may seem familiar to you from your work with other testing libraries; now that you have the basics down and can see that things are up and running, it's time to see what Interactors can really do.

## A look at real-world interactors

What if testing a more complex UI was as straightforward as using that button interactor? In your past work, you might have seen that date pickers, custom radio buttons, and modals can be difficult to test, especially when you add in animations and async loading patterns. However, with interactors, your tests can be reliable, simple, and readable.

Here's an example of what a test for an airline datepicker interface could look like, using interactors:

<Tabs
  defaultValue="jest"
  values={[
    {label: 'Jest', value: 'jest'},
    {label: 'Cypress', value: 'cypress'},
    {label: 'BigTest (alpha)', value: 'bigtest'}
]}>
  <TabItem value="jest">

  ```js
  import { Heading, RadioButton, TextField } from 'bigtest';
  import { DatePicker, Modal } from './MyInteractors';

  describe('Interactors with Jest', () => {
    beforeEach(() => render(<App />));

    it('date picker for flights', async () => {
      await RadioButton('One-way').click();
      await TextField('FROM').fillIn('LAX');
      await TextField('TO').fillIn('YYZ');
      await DatePicker().select('June, 2022', '10'));
      await Modal({ id: 'loading' }).exists();
      await Heading('Departing flight').exists();
    })
  })
  ```

  </TabItem>
  <TabItem value="cypress">

  ```js
  import { Heading, RadioButton, TextField } from '@bigtest/cypress';
  import { DatePicker, Modal } from './MyInteractors';

  describe('Interactors with Cypress', () => {
    beforeEach(() => cy.visit('/'));

    it('date picker for flights', () => {
      cy.do(
        RadioButton('One-way').click();
        TextField('FROM').fillIn('LAX');
        TextField('TO').fillIn('YYZ');
        DatePicker().select('June, 2022', '10'));
      );
      cy.expect(
        Modal({ id: 'loading' }).exists();
        Heading('Departing flight').exists();
      );
    })
  })
  ```

  </TabItem>
  <TabItem value="bigtest">

  ```js
  import { Heading, RadioButton, Page, test, TextField } from 'bigtest';
  import { DatePicker, Modal } from './MyInteractors';

  export default test('BigTest')
    .step(
      Page.visit('/'),
      RadioButton('One-way').click(),
      TextField('FROM').fillIn('LAX'),
      TextField('TO').fillIn('YYZ'),
      DatePicker().select('June, 2022', '10')),
    .assertion(
      Modal({ id: 'loading' }).exists(),
      Heading('Departing flight').exists());
  ```

  </TabItem>
</Tabs>

This is just a sneak peak of what is possible! By the time you're done reading through our guide, you'll be able to write and use such interactors.

## Next steps

### Continue learning about Interactors

Try using more of the [Built-in Interactors](2-built-in-dom.md) within your tests, such as `Link`, `Checkbox`, `TextField`, and more.

Once you are comfortable with those, you are ready to [write your own Interactors](4-write-your-own.md).

### Try out more BigTest features

Once you are comfortable with those, you are ready to [write your own Interactors](/docs/interactors/write-your-own).

### Join the BigTest community

If you want to know more about BigTest or run into any problem with Interactors, you can reach out to us on our Discord channel. We're eager to help you get started and hear your feedback to improve BigTest. [Join us today!](https://discord.gg/r6AvtnU)
