---
id: write-your-own
title: Writing Interactors
---

Nearly every app has at least one user interaction that is strange or special, like date pickers, drag and drop areas, masked radio buttons, modals, and more. It is normal to write your own Interactors, where you can make complex interactions as easy to test as a button click.

In this section, you will learn how to create a new Interactor for any interface and use it in your tests. We will start with a simple example for learning purposes, level up to a more complex example, and then cover common questions.

## Writing your first interactor

In this example, we will create our own `Button` Interactor, similar to the one found in the [built-in DOM interactors](2-built-in-dom.md), and use it in a test.

There are four things to decide:
1. What to name and label of the interactor.
2. Which HTML element to target, like `'input[type=button]'`
3. The locator and filters, which helps users be able to narrow down the element they want to reference.
4. Which actions a test should be able to `perform` on that element, like a `click`

Putting this information together, we can make this new Interactor:

```js
import { createInteractor, perform } from 'bigtest';

export const Button = createInteractor<HTMLButtonElement>('my-button')({
  selector: 'input[type=checkbox]',
  locator: (element) => element.id,
  filters: {
    value: (element) => element.value
  }
  actions: {
    click: perform((element) => { element.click(); })
  }
});
```

The string argument to `createInteractor()` is the name of the interactor your console will print.

<!-- example here of console output -->

And also note that locators, filters, and actions are optional when creating your own interactor. If you create an interactor without a locator, it will default to `locator: element => element.textContent`.

Now import the new interactor and add it to a test:

```js
import { Heading, Page, test } from 'bigtest';
import { Button } from './MyButton';

export default test('login form')
  .step(Page.visit('/'))
  .assertion(Heading('Log In').exists())
  .child('fill username and click button', test => test
    .step(Button('sign-in-button').click())
    .assertion(Heading('You are logged in!').exists()));
```

<!-- add cypress and jest here too? -->

In this example, we are passing in `sign-in-button` as the locator which we configured as the `id`.

The [Button](/) interactor from BigTest does a lot more than what we just wrote, but this small example is a good place to start for understanding how to use `createInteractor`.

<!-- Can you think of how you could expand this? Maybe you could add a `check` or `uncheck` action. Maybe for test readability, you would like to have actions named `accept` or `decline` for testing an end user agreement form. It is up to you! -->

Check out the API page of [createInteractor()](/) for more details.

<!-- to do - a more complex example -->
```js
import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('table cell')({
  selector: '[role=gridcell]',
  locator: element => element.id, // i changed this from textContent to id; maybe we can say how often times we would locate by textcontent but in cases where (say if a button is an image), we could change the default locator to something else so that a user can do `Button('id-button')` as opposed to `Button({ id: 'id-button' })`.
  filters: {
    columnTitle: element => {
      const siblingCells = Array.from(element.closest('[class^=mclRow-]').querySelectorAll('[role=gridcell]'));
      let position = -1;

      for (const cell of siblingCells) {
        position++;
        if (cell === element) {
          break;
        }
      }

      const headerAtPosition = Array.from(
        element.closest('[class^=mclContainer-]')
          ?.querySelector('[class^=mclHeaderRow-]')
          ?.querySelectorAll('[role=columnheader]')
      )[position];

      return headerAtPosition.textContent;
    },
    rowNumber: element => {
      const headerRowOffset = 2;
      return element.closest('[role=row]').getAttribute('aria-rowindex') - headerRowOffset;
    }
  },
  actions: {
    click: perform((element) => {
      element.click();
    })
  }
});
```

## Common questions

### When should I write a new Interactor instead of using the Built In DOM interactors?

If the built-in DOM Interactors work for your use case, they are probably the best choice.
They are maintenance-free and support the most common user actions.

When the built-ins are not enough, it is normal and encouraged for you to write your own Interactors!
They will help you prevent duplicated logic in your tests, and if your interface changes, you only need to make the change in one place.

For example, let's say that you want to replace a custom datepicker with a popular third-party library instead.
Although you may have many tests for flows with the date picker, only your Interactor needs to change.

### I have an interaction that is really difficult to test. What should I do?

A good test suite helps you uncover hidden problems.
Often, difficult UI tests are your early warning system for areas of your app that may have accessibility issues.

The first step is to see if you can go through the interaction yourself in the browser by using only [keyboard navigation](https://webaim.org/techniques/keyboard/).
If you cannot get to the end successfully, then you just found a bug in your app!
Although many people navigate an interface by sight and clicking,
others may use assistive technology such as screen readers, and keyboard support is critical.
For example, have you ever seen a click mistakenly attached to a `div` instead of a button?
Those types of errors can make your app unusable to some people, and also difficult to test.

Another way to find some bugs is to use automated tools such as [Lighthouse](https://github.com/GoogleChrome/lighthouse) to find problems in your HTML markup, like missing input labels or misconfigured `aria` attributes.

<!-- todo - advice for what to do if the problem is not accessibility -->
