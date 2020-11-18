---
id: quick-start
title: Quick Start
slug: /
---

Welcome to BigTest! By the end of this guide, you will be testing your own app with Interactors.
Instead of writing lots of code in all your tests to simulate user interactions, you can write small, reusable bits of interaction code that can be shared across tests and even across testing frameworks.

<!-- 
1-2 sentences saying what Interactors are. These sentences address the question “what is this for?” and “why is this valuable to me?”
  - jonas' definition: Interactor: an object which describes a type of UI element in an application and provides actions to interact with elements of this type, as well as assertions to check against them. (note: the term interactor is actually a bit overloaded, since we use it to describe both the abstract definition of an interactor, and also a specific instance of it, i.e. Button vs Button("Submit"), my definition describes the former)
  - from the detailed interactor docs notes: BigTest DOM Interactors make writing UI tests easier, faster, less flaky, and when failures do occur, provide you with the highest order of precision so that you can diagnose what went wrong quickly.

1 sentence that says what you will accomplish by the end of the quickstart
-->

## Prerequisites
- `npm` or `yarn`
- Node
- An app that uses Jest or Cypress for the test suite

If your app does not use Jest or Cypress, you can follow along with this tutorial using our sample app, [BigTest TodoMVC](#todo).

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

<!-- 
Install dependencies in an existing app that has a test suite set up
  - The quickstart should walk someone through adding this into their real app, and an example app is provided only for people who do not already have one set up
  - We will cover Cypress first as we work, and include Jest when it’s ready. We can show both frameworks using Tabs in Docusaurus. Need to be careful to not explain the code samples in depth so that we do not overlap too much with Integrations, and also so that the prose fits both libraries
-->

## Import Interactors in your test suite

Interactors can be used within many different testing frameworks. 

If you are already using Jest or Cypress, here is how you can import the `Button` interactor into your tests:

<Tabs
  defaultValue="jest"
  values={[
    {label: 'Jest', value: 'jest'},
    {label: 'Cypress', value: 'cypress'}
  ]}>
  <TabItem value="jest">

  ```jsx
  import React from 'react';
  import { render } from '@testing-library/react';
  import App from './App';

  import { Button } from 'bigtest';

  describe('Jest with Interactors', () => {
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
  import { Button } from 'bigtest';

  describe('Cypress with Interactors', () => {
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
</Tabs>


<!--

Show importing a Button interactor, using it, and running the tests to see that they pass.

Show importing a text input interactor, using it, and running tests to see that they pass
  - do we need to show a second example?

Next steps section - invite readers to continue reading the Guides. Link to where to get help.

-->