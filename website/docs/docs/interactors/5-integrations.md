---
id: integrations
title: Jest & Cypress
---

Interactors can be used within many different frameworks!
They are designed to be framework-agnostic so that you can integrate them into your existing test suites.

In this section, you can find examples for using Interactors in some of the most popular testing frameworks in the JavaScript ecosystem. 
You will also learn about helper methods that make your tests as readable as possible.

If your testing framework is not on this list, you may still be able to use Interactors. They work best with testing tools that:

- Are focused on testing user interactions, such as clicks and filling in forms
- Rely on the DOM or a simulated DOM (such as [`jsdom`](https://github.com/jsdom/jsdom))

If you would like to add some examples for your favorite testing tools to these guides, click the "Edit this page" link at the bottom of the page.

## Jest

When you use interactors in [Jest](https://jestjs.io/), there are only a few things you need to know to fit them in with the tests you have already written.

First, interactors replace both user actions and test assertions:

```jsx
import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

import { Button } from 'bigtest';

describe('Interactors with Jest', () => {
    beforeEach(() => render(<App />));

    it('clicks button', async () => {
        await Button('Sign In').click();
        await Button('Log Out').exists();
    })
})
```

Lines such as `await Button('Log Out').exists()` replace assertions like `expect(someElement).toBeTruthy()`.

If an interactor's assertion fails, the error will be received by Jest and you will see it in your test output.

Note that the interactors are async, and so you need to mark your test function as `async`, and you should `await` the interactors and their assertions.

## Cypress

In Cypress, interactors fit right in, though you may need some slight configuration for ES Modules and TypeScript, which we will cover below.

Interactors take care of the command registration for you. They are already registered whenever you are importing and creating interactors.
You can use interactors in Cypress tests like this:

```jsx
import { Button } from 'bigtest';

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

### ES Modules

To use `import` and `export` in your tests, your project needs to support [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). You may already have this set up, but if you do not, you may see a warning like this if you try to `import` anything in your test:

> ParseError: 'import' and 'export' may appear only with 'sourceType: module'

Follow [these steps](https://stackoverflow.com/questions/53650208/cypress-parseerror-import-and-export-may-appear-only-with-sourcetype-modu) to get them working.

### TypeScript

Typescript users should make sure to add `bigtest` to the types array in `tsconfig`:

```
"types": ["cypress", "bigtest]
```

See [this article](https://glebbahmutov.com/blog/use-typescript-with-cypress/#transpile-typescript-using-webpack) for more details.

<!-- TODO check this for accuracy and see if these are the correct links. -->
