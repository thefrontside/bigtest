---
id: write-your-own
title: Writing Interactors
---

Nearly every app has at least one user interaction that is unusual or special, like date pickers, drag and drop areas, masked radio buttons, modals, and more. It is normal to write your own Interactors, where you can make complex interactions as easy to test as a simple button click.

In this section, you will learn how to create a new Interactor for any interface and use it in your tests. We will start with a simple example for learning purposes, level up to a more complex example, and then cover common questions.

> :exclamation: There are new, exciting changes in the works for the `createInteractor()` API. Those changes will deprecate the syntax you see in the examples below, but the refactoring process will be very simple. We will output clear instructions in your console on how you can update to the new syntax so you can use Interactors today without worrying too much about tomorrow.

## Writing your first interactor

In this example, we will create our own `TextField` Interactor to use as an alterantive to the one offered by BigTest as you may have seen in the [`Locators, Filters, and Actions`](/docs/interactors/locators-filters-actions) page.

There are four things to decide:
1. What to name and label the interactor
2. Which HTML element or elements to target
3. The locator and filters, which helps users be able to narrow down the element they want to reference.
4. Actions that a test should be able to `perform` on that element, like `click`

Putting this information together, we can make this new Interactor:

```js
import { createInteractor, perform, fillIn } from 'bigtest';

export const TextField = createInteractor<HTMLInputElement>('my-textfield-interactor')({
  selector: 'input[type=text]',
  locator: (element) => element.placeholder,
  filters: {
    value: (element) => element.value
  },
  actions: {
    fillIn: perform(fillIn)
  }
});
```

> `fillIn` is a function exported by `bigtest`. See the implementation on its [API](/docs/interactors/api/functions/fillin) page. You can use any of the functions defined by BigTest or implement your own.

In this example we've configured the selector as `input[type=text]` which will search for all `<input type='text'>` elements in your testing environment. Filters and locators are used to narrow down the list of results.

The string argument to `createInteractor()` is the name of the interactor your console will print if there's a failing test:
```
NoSuchElementError: did not find my-textfield-interactor "USERNAME"
```
_An example of the console output when a test is unable to locate the interactor_

And also note that locators, filters, and actions are optional when creating your own interactor. If you create an interactor without a locator, it will default to `locator: element => element.textContent`. The locator for the `TextField` interactor offered by BigTest uses the `textContent` of the associated label as we mentioned in the [previous page](/docs/interactors/locators-filters-actions#filters). The example above has its locator configured as `element.placeholder`; this is just to demonstrate that you can set these properties to anything that suits your needs.

Lastly, you might be wondering what `perform()` does. The `perform()` function is just a short way of writing interactions. So a click action written like this:

```js
actions: {
  click: perform(element => element.click())
}
```

Is the same as:

```js
actions: {
  click: async (interactor) => {
    await interactor.click();
  }
}
```

The latter syntax is necessary if you want to write an action that delegates to other interactors' actions. For example say you want to create a Form interactor that has a submit action, you could take this approach:

```js
import { Button, createInteractor } from 'bigtest';

export const Form = createInteractor<HTMLFormElement>('form')({
  selector: 'form',
  actions: {
    async submit(interactor){
      await interactor.find(Button('Submit')).click();
    }
  }
})
```

Delegating the click action will save you the hassle of having to implement the click separately and there is also the added benefit of making your tests easier to read:

```js
Form.find(Button('Submit')).click();

// versus

Form.submit();
```

Now let's get back to our example and import the new TextField interactor from earlier and add it to a test:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

  import { Button, Heading } from 'bigtest';
  import { TextField } from './MyTextField';

  describe('email subscription form', () => {
    beforeEach(() => render(<App />));

    it('fill and submit email address', async () => {
      await TextField('EMAIL').fillIn('batman@gmail.com');
      await Button('Subscribe').click();
      await Heading('Success!').exists();
    })
  })
  ```

  </TabItem>
  <TabItem value="cypress">

  ```js
  import { Button, Heading } from 'bigtest';
  import { TextField } from './MyTextField';

  describe('email subscription form', () => {
    beforeEach(() => cy.visit('/'));

    it('fill and submit email address', () => {
      cy.do([
        TextField('EMAIL').fillIn('batman@gmail.com');
        Button('Subscribe').click();
      ]);
      cy.expect(Heading('Success'))
    })
  })
  ```

  </TabItem>
  <TabItem value="bigtest">

  ```js
  import { Button, Heading, Page, test } from 'bigtest';
  import { TextField } from './MyTextField';

  export default test('email subscription form')
    .step(Page.visit('/'))
    .child('fill and submit email address', test => test
      .step(
        TextField('EMAIL').fillIn('batman@gmail.com'),
        Button('Subscribe').click())
      .assertion(Heading('Success!').exists()));
  ```

  </TabItem>
</Tabs>

In this example we are testing an email subscription form by first filling in the email textfield, clicking the `Subscribe` button, and then asserting for the success header.

The [TextField](/docs/interactors/api/variables/textfield) interactor from BigTest does a lot more than what we just wrote, but this small example is a good place to start for understanding how to use `createInteractor`.

Check out the API page of [createInteractor()](/docs/interactors/api/functions/createinteractor) for more details.

## Writing your second interactor

One of the greatest benefits of Interactors is that you can turn complex testing scenarios into readable assertions. Let's create an interactor for a table that navigates by row and column to make assertions about the table's data. When we are finished, we can use it in our tests like this:

```js
TableCell({ columnTitle: 'Name', rowNumber: 2 }).has({ value: 'Marge Simpson' });
```

First let's look at the markup we're trying to filter through:

```html
<div role="grid">
  <div class="HeaderRow" role="row" aria-rowindex="1">
    <div role="columnheader">Name</div>
    <div role="columnheader">Birthday</div>
  </div>
  <div role="row" aria-rowindex="2">
    <div class="Row">
      <div role="gridcell">Homer Simpson</div>
      <div role="gridcell">May 12, 1956</div>
    </div>
  </div>
  <div role="row" aria-rowindex="3">
    <div class="Row">
      <div role="gridcell">Marge Simpson</div>
      <div role="gridcell">October 1, 1956</div>
    </div>
  </div>
</div>
```

Here is one way to create the `TableCell` interactor:

```js
import { createInteractor, perform } from 'bigtest';

export const TableCell = createInteractor('table cell')({
  selector: '[role=gridcell]',
  filters: {
    columnTitle: element => {
      const siblingCells = Array.from(element.closest('[class=Row]')
        .querySelectorAll('[role=gridcell]'));
      let position = -1;

      for (const cell of siblingCells) {
        position++;
        if (cell === element) {
          break;
        }
      };

      const headerAtPosition = Array.from(
        element.closest('[role=grid]')
          ?.querySelector('[class=HeaderRow]')
          ?.querySelectorAll('[role=columnheader]')
      )[position];

      return headerAtPosition.textContent;
    },
    rowNumber: element => {
      const offset = 1;
      return element.closest('[role=row]').getAttribute('aria-rowindex') - offset;
    }
  }
});
```
> This example uses [optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) which is only available in Node >=14.

You'll notice we created `columnTitle` and `rowNumber` filters that will access its parent elements to get the appropriate value we're looking for. The locator was not specified so it will default to `element.textContent`.

Now let's pretend we're testing a Jeopardy chart where we have multiple tablecells with similar values:

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

  import { TableCell } from './tablecell';

  describe('Jeopardy chart', () => {
    beforeEach(() => render(<App />));

    it('host clicks on tablecell', async () => {
      await TableCell('$600', { columnTitle: 'Politics' }).exists();
      await TableCell({ columnTitle: 'Politics', rowNumber: 2 }).click();
      await TableCell('$600', { columnTitle: 'Politics' }).absent();
    });
  });
  ```

  </TabItem>
  <TabItem value="cypress">

  ```js
  import { TableCell } from './tablecell';

  describe('Jeopardy chart', () => {
    beforeEach(() => cy.visit('/'));

    it('host clicks on tablecell', () => {
      cy.expect(TableCell('$600', { columnTitle: 'Politics' }).exists());
      cy.do(TableCell({ columnTitle: 'Politics', rowNumber: 2 }).click());
      cy.expect(TableCell('$600', { columnTitle: 'Politics' }).absent());
    });
  });
  ```

  </TabItem>
  <TabItem value="bigtest">


  ```js
  import { Page, test } from 'bigtest';
  import { TableCell } from './tablecell';

  export default test('Jeopardy chart')
    .step(Page.visit('/'))
    .assertion(TableCell('$600', { columnTitle: 'Politics' }).exists())
    .child('host clicks on tablecell', test => test
      .step(TableCell({ columnTitle: 'Politics', rowNumber: 2 }).click())
      .assertion(TableCell('$600', { columnTitle: 'Politics' }).absent()));
  ```

  </TabItem>
</Tabs>

<!-- i think we need to tie it off here somehow -->

## find

Lastly, we need to go over the `find` method. Some interactors use the `find` method to chain interactors together. It returns a new interactor scoped within the current interactor, and is generally used for composing actions from primitives:

```js
createInteractor('DatePicker')({
  actions: {
    open: (picker) => picker.find(Button).click()
  }
});
```

You can also use the `find` method in your tests:

```js
DatePicker().find(Button('31')).click();
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
