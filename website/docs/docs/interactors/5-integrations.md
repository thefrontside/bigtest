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

When you use interactors in Jest, there are only a few things you need to know to fit them in with the tests you have already written.

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

- do/expect commands automatically registered when importing interactors or creating interactors
- may need to follow [these] steps for enable esmodules
- for typescript make sure you add ["types"] in tsconfig

<!-- 
- 1-2 sentence intro
- Code sample
- What someone will learn how to do
- Detailed explanation and examples
- Link to demo 
-->
