---
id: integrations
title: Jest & Cypress
---

Interactors can be used within many different frameworks. They are designed to be framework-agnostic so that you can integrate them into your existing test suites.

In this section, you can find explanations for using Interactors in some of the most popular testing frameworks within the JavaScript ecosystem. You will also learn about helper methods that make your tests as readable as possible.

If your testing framework is not on this list, you may still be able to use Interactors. They work best with testing tools that:

- Are focused on testing user interactions, such as clicks and filling in forms
- Rely on the DOM or a simulated DOM (such as [`jsdom`](https://github.com/jsdom/jsdom))

## Jest

When you use interactors in Jest, there are only a few things you need to know to fit them in with the tests you have already written.

First, interactors replace both user actions and test assertions. That means that you will not need `expect` anymore. For instance, instead of making an assertion as `expect(‘button’).toBeTruthy()`  you can use `await Button('Log Out’).exists()`. The example below illustrates how to use Interactors within Jest:

```js
import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

import { Button } from '@interactors/html';

describe('Interactors with Jest', () => {
  beforeEach(() => render(<App />));

  it('clicks button', async () => {
    await Button('Sign In').click();
    await Button('Log Out').exists();
  });
});
```

If an interactor's assertion fails, the error will be received by Jest and you will see it in your test output.

Note that the interactors are asynchronous, and so you need to mark your test function as `async`, and you should `await` the interactors and their assertions.

:::info Events in JSDOM
JSDOM versions 15 and below do not have support for `InputEvent` on which interactors rely. If you are using one of these older versions, which unfortunately was the case for `create-react-app` prior to `v4.0.0`, you will need to make sure your tests are running in `JSDOM >= 16.0.0`.
:::

## Cypress

Interactors fit right in with Cypress as well, though as we explain below you may need some slight configuration for ES Modules and TypeScript. In order to use interactors with Cypress, you will need to install `@bigtest/cypress` - this package is from where you would import any of the [predefined interactors](/bigtest/docs/interactors/predefined-interactors).

Interactors can be used with the `cy.do()` and `cy.expect()` commands for interactions and assertions respectively. These Cypress commands are automatically registered whenever you are importing or creating interactors, and can take either a single interactor or an array of interactors. This helps your Cypress tests follow a arrange-act-assert pattern, which is inherent to [BigTest](/bigtest/docs/platform/architecture) and thus to Interactors.

In the following example, we demonstrate how to to use `cy.do()` and `cy.expect()` in a Cypress test together with Interactors:

```js
import { Button } from '@interactors/with-cypress';

describe('Interactors with Cypress', () => {
  beforeEach(() => cy.visit('/'));

  it('clicks button', () => {
    cy.do(
      Button('Sign In').click()
    );
    cy.expect([
      Button('Sign In').absent(),
      Button('Log Out').exists()
    ]);
  });
});
```

The `cy.do()` and `cy.expect()` commands can take either a single interaction or an array of interactions.

### ES Modules

To use `import` and `export` in your tests, your project needs to support [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). You may already have this set up, but if you do not you may see a warning like this if you try to `import` anything in your test:

> ParseError: 'import' and 'export' may appear only with 'sourceType: module'

Follow [these steps](https://github.com/cypress-io/cypress/tree/master/npm/webpack-preprocessor#cypress-webpack-preprocessor) to get ES Modules working.

### TypeScript

TypeScript users should make sure to add `cypress` to the types array in `tsconfig`:
```
{
  "compilerOptions: {
    "types": ["cypress"]
  }
}
```
See Cypress' guide on [TypeScript support](https://docs.cypress.io/guides/tooling/typescript-support.html#Configure-tsconfig-json) for more details.
