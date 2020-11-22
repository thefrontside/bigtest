---
id: quick-start
title: Quick Start
slug: /platform
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
