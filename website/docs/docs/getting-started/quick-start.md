---
id: quick-start
title: Quick Start
slug: /
---

Welcome to BigTest! By the end of this guide, you will be testing your own app
with Interactors.
Instead of writing lots of code in all your tests to simulate user interactions,
you can write small, reusable bits of interaction code that can be shared across
tests and even across testing frameworks.

<!-- 

1-2 sentences saying what Interactors are. These sentences address the question “what is this for?” and “why is this valuable to me?”
1 sentence that says what you will accomplish by the end of the quickstart
-->

## Prerequisites

- `yarn` or `npm`
- Node
- An app that uses Jest or Cypress for the test suite

If your app does not use Jest or Cypress, you can follow along with this
tutorial using our sample app, [ToDo Sample App](#todo).

## Installation

First, install `bigtest` in your app:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="yarn"
  values={[
    {label: 'Yarn', value: 'yarn'},
    {label: 'NPM', value: 'npm'}
  ]}>
  <TabItem value="yarn">
    <pre><code>$ yarn add -D bigtest</code></pre>
  </TabItem>
  <TabItem value="npm">
    <pre><code>$ npm install -D bigtest</code></pre>
  </TabItem>
</Tabs>


## Import Interactors in your test suite

Interactors can be used within many different testing frameworks.
If you are already using Jest or Cypress,


<!--

Install dependencies in an existing app that has a test suite set up

We will cover Cypress first as we work, and include Jest when it’s ready. We can show both frameworks using Tabs in Docusaurus. Need to be careful to not explain the code samples in depth so that we do not overlap too much with Integrations, and also so that the prose fits both libraries
Show importing a Button interactor, using it, and running the tests to see that they pass.
Show importing a text input interactor, using it, and running tests to see that they pass
Next steps section - invite readers to continue reading the Guides. Link to where to get help.


- jonas: Interactor: an object which describes a type of UI element in an application and provides actions to interact with elements of this type, as well as assertions to check against them. (note: the term interactor is actually a bit overloaded, since we use it to describe both the abstract definition of an interactor, and also a specific instance of it, i.e. Button vs Button("Submit"), my definition describes the former)

-->