---
id: quick-start
title: Quick Start
slug: /
---

BigTest DOM Interactors make writing UI tests easier, faster, and more reliable.
When failures do occur, you get the highest order of precision so that you can
diagnose what went wrong quickly.

By the end of this quick start, you will be testing your own app with Interactors.

<!-- Links to places to get help or ask questions -->

<!-- 
1-2 sentences saying what Interactors are. These sentences address the question “what is this for?” and “why is this valuable to me?”
  - jonas' definition: Interactor: an object which describes a type of UI element in an application and provides actions to interact with elements of this type, as well as assertions to check against them. (note: the term interactor is actually a bit overloaded, since we use it to describe both the abstract definition of an interactor, and also a specific instance of it, i.e. Button vs Button("Submit"), my definition describes the former)
  - from the detailed interactor docs notes: BigTest DOM Interactors make writing UI tests easier, faster, less flaky, and when failures do occur, provide you with the highest order of precision so that you can diagnose what went wrong quickly.

1 sentence that says what you will accomplish by the end of the quickstart
-->

## Prerequisites

- `npm` or `yarn`
- Node 12
- An app that uses Jest, Cypress, or BigTest. Or, you can follow along with this
tutorial using our sample app, [BigTest TodoMVC](#todo).

## Installation

First, install `bigtest` in your app:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="npm"
  values={[
    {label: 'NPM', value: 'npm'},
    {label: 'Yarn', value: 'yarn'}
  ]}>
  <TabItem value="npm">
    <pre><code>$ npm install -D bigtest</code></pre>
  </TabItem>
  <TabItem value="yarn">
    <pre><code>$ yarn add -D bigtest</code></pre>
  </TabItem>
</Tabs>

## Import Interactors in your test suite

Interactors can be used within many different testing frameworks.
Click on the tabs below to see some examples!

We will start with one of the simplest user interactions.
Find a test that has a button click in it.
In that test, import the `Button` interactor from `bigtest`,
and replace the click:

<!-- Maybe need a nod to the fact that you can do a lot more with
Interactors, since someone cannot yet see the problem this solves for them
when it is such a straightforward interaction -->

<Tabs
  defaultValue="jest"
  values={[
    {label: 'Jest', value: 'jest'},
    {label: 'Cypress', value: 'cypress'},
    {label: 'BigTest (alpha)', value: 'bigtest'}
  ]}>
  <TabItem value="jest">

  ```jsx
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

  ```jsx
  import { Button } from 'bigtest';

  describe('Interactors with Cypress', () => {
    beforeEach(() => cy.visit('/'));

    it('clicks button', () => {
      cy.do(
        Button('Sign In').click()
      );
      // the rest of your test that was already written
    })
  })
  ```

  </TabItem>
  <TabItem value="bigtest">

  ```jsx
  import { Button, Page, test } from 'bigtest';

  export default test('BigTest')
    .step(
      Page.visit('/'),
      Button('Sign In').click())
    .assertion(Button('Log out').exists());
  ```

  </TabItem>
</Tabs>

Now, run your tests! Congratulations, you used your first interactor.

## Making test assertions

Add `.absent()` or `.exists()` to make an assertion about your button.

In this example, we are testing that the Sign In button disappears after
a click, and a Log Out button appears:

<Tabs
  defaultValue="jest"
  values={[
    {label: 'Jest', value: 'jest'},
    {label: 'Cypress', value: 'cypress'},
    {label: 'BigTest (alpha)', value: 'bigtest'}
  ]}>
  <TabItem value="jest">

  ```jsx
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

  ```jsx
  describe('Interactors with Cypress', () => {
    beforeEach(() => cy.visit('/'));

    it('clicks button', () => {
      cy.do(
        Button('Sign In').click()
      );
      cy.expect([
        Button('Sign In').absent(),
        Button('Log Out').exists(),
      ])
    })
  })
  ```

  </TabItem>
  <TabItem value="bigtest">

  ```jsx
  import { Button, Page, test } from 'bigtest';

  export default test('BigTest')
    .step(
      Page.visit('/'),
      Button('Sign In').click())
    .assertion(Button('Log out').exists());
  ```

  </TabItem>
</Tabs>

<!-- consider using a text input example instead of button click -->

## Next steps

Next, try using more of the [built-in Interactors](#todo) within your tests,
such as `Link`, `Checkbox`, `TextField`, and more.
Once you are comfortable with those, 
you can learn how to [write your own Interactors](#todo).

<!-- product call to action -->
