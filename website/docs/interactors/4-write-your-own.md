---
id: write-your-own
title: Writing Interactors
---

Nearly every app has at least one user interaction that is strange or special, like date pickers, drag and drop areas, masked radio buttons, modals, and more. It is normal to write your own Interactors, where you can make complex interactions as easy to test as a simple button click.

<!--
🧹👆
"strange" seems like a very charged word, can we choose something more neutral like "unusual" or "non-standard" or something? 
-->

In this section, you will learn how to create a new Interactor for any interface and use it in your tests. We will start with a simple example for learning purposes, level up to a more complex example, and then cover common questions.

## Writing your first interactor

In this example, we will create our own `Button` Interactor to use as an alterantive to the one offered by BigTest as you may have seen in the [`quick start`](/docs/interactors) section.

<!--
🧹👆
Can we start with something even simpler? Something like `Sidebar` or something would be nice?
-->

There are four things to decide:
1. What to name and label the interactor
2. Which HTML element or elements to target
3. The locator and filters, which helps users be able to narrow down the element they want to reference.
4. Actions that a test should be able to `perform` on that element, like `click`

Putting this information together, we can make this new Interactor:

```js
import { createInteractor, perform } from 'bigtest';

export const Button = createInteractor<HTMLButtonElement>('my-button-interactor')({
  selector: 'button, input[type=button]',
  locator: (element) => element.id,
  filters: {
    value: (element) => element.textContent
  },
  actions: {
    click: perform((element) => { element.click() })
  }
});
```

<!--
🧹👆
The example, which uses an id for the locator goes against the advice we gave for interactor in the previous section. The id is for computers. I know we want to make it different, but maybe we can use `aria-label` for the locator instead? That's something a user with assistive technology would use to identify the UI element.
-->

In this example we've configured the selector as `'button, input[type=button]'` which will target both `<button>` and `<input type='button'>` elements.

<!--
🧹👆
What does "target" mean? It could mean a couple of things, so maybe it's worth expanding on this to say that the selector chooses a flat list top level elements that will be considered. Filters and locators are used to narrow this list.
-->

The string argument to `createInteractor()` is the name of the interactor your console will print if there's a failing test:
```
NoSuchElementError: did not find my-button-interactor "sign-in"
```
_An example of the console output when a test is unable to locate the interactor_

And also note that locators, filters, and actions are optional when creating your own interactor. If you create an interactor without a locator, it will default to `locator: element => element.textContent`. The example above has its locator configured as `element.id`; this was just to demonstrate that it does not always have to be `element.textContent` and you can set these properties to anything that suits your needs.

Now let's import the new interactor and add it to a test:

```js
import { Heading, Page, test } from 'bigtest';
import { Button } from './MyButton';

export default test('login form')
  .step(Page.visit('/'))
  .assertion(Heading('Log In').exists())
  .child('fill username and click button', test => test
    .step(Button('sign-in-button-id').click())
    .assertion(Heading('You are logged in!').exists()));
```

<!--
🧹👆
The code snippet only has a rendition in Platform, not Cypress or Jest
-->

In this example using the Bigtest Platform, we are passing in `sign-in-button-id` to the Button because its locator was configured to search for `element.id`.

The [Button](/) interactor from BigTest does a lot more than what we just wrote, but this small example is a good place to start for understanding how to use `createInteractor`.

Check out the API page of [createInteractor()](/) for more details.

## Writing your second interactor
Below is a more complex demonstration of what you can do with interactors:

<!--
🧹👆
Rather than put the implementation first here with the table cell interactor, talking about how you can use filters to make very complex, yet very readable assertions is one of the great strengths of interactors. Leading with an example of how awesome it is to _use_ the power filter is going to sell more than the somewhat large implementation, which without seeing the benefit first, is hard to evaluate in context.

Something like this:
```js
TableCell({ columnTitle: 'politics', row: 3 }).has({ value: '$600' });
```
-->

```js
import { createInteractor, perform } from 'bigtest';

export const TableCell = createInteractor('table cell')({
  selector: '[role=gridcell]',
  filters: {
    columnTitle: element => {
      const siblingCells = Array.from(element.closest('[class^=mclRow-]').querySelectorAll('[role=gridcell]'));
      let position = -1;

      for (const cell of siblingCells) {
        position++;
        if (cell === element) {
          break;
        }
      };

      const headerAtPosition = Array.from(
        element.closest('[class^=mclContainer-]')
          ?.querySelector('[class^=mclHeaderRow-]')
          ?.querySelectorAll('[role=columnheader]')
      )[position];

      return headerAtPosition.textContent;
    },
    rowNumber: element => {
      const headerRowOffset = 1;
      return element.closest('[role=row]').getAttribute('aria-rowindex') - headerRowOffset;
    }
  },
  actions: {
    click: perform((element) => { element.click() })
  }
});
```

<!--
🧹👆
There is a very significant jump in complexity in this example. This seems like the type of the interactor we should bundle, but it doesn't seem great as a teaching aid.
-->

You'll notice we created `columnTitle` and `rowNumber` filters that will access its parent elements to get the appropriate value we're looking for. The locator was not specified so it will default to `element.textContent`.

Now let's pretend we're testing a Jeopardy chart where we have multiple tablecells with similar values:
```js
import { Page, test } from 'bigtest';
import { TableCell } from './tablecell';

export default test('Jeopardy chart')
  .step(Page.visit('/'))
  .assertion(TableCell('$600', { columnTitle: 'politics' }).exists())
  .child('host clicks on tablecell', test => test
    .step(TableCell({ columnTitle: 'politics', rowNumber: 2 }).click())
    .assertion(TableCell('$600', { columnTitle: 'politics' }).absent()));
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
