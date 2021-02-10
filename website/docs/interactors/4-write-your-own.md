---
id: write-your-own
title: Writing Interactors
---

Nearly every app has at least one user interaction that is unusual or special, like date pickers, drag and drop areas, masked radio buttons, modals, and more. Creating your own Interactors allows you to easily test complex interactions as easy to test as a button click.

In this section, you will learn how to write a new Interactor for any interface and use it in your tests. We will start with a simple example for learning purposes, level up to a more complex scenario, and then cover common questions.

## Writing your first interactor

In this tutorial, we will create our own `TextField` Interactor. Although BigTest has this type of interactor built-in, recreating it is a great way to learn all the pieces that make up an interactor while using familiar examples.

There are four things to decide when creating an interactor:
1. What to name and label the interactor
2. Which HTML element or elements to target
3. The locator and filters, which helps users be able to narrow down the element they want to reference
4. The action or actions that a test should `perform` when using the interactor (like `click`)

In this case, let's call our Interactor ‘MyTextField’, and we’ll label it as ‘my-textfield-interactor’ to distinguish it from the built-in one. Let’s say that MyTextField will target a regular input with a custom class `.my-input`, which means its HTML selector would be `input[type=text].my-input`. For locator we’ll use the input’s placeholder, and we’ll define a value filter. Finally, we’ll define a `fillIn` action for MyTextField interactor. Putting this together, we get the following definition of an Interactor:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="npm"
  values={[
    {label: 'Javascript', value: 'javascript'},
    {label: 'Typescript', value: 'typescript'}
]}>
  <TabItem value="javascript">

  ```js
  import { createInteractor, fillIn } from 'bigtest';

  export const TextField = createInteractor('my-textfield-interactor')
    .selector('input[type=text]')
    .locator((element) => element.placeholder)
    .filters({
      value: (element) => element.value
    })
    .actions({
      fillIn: (interactor) => interactor.perform(fillIn)
    });
  ```

  </TabItem>
  <TabItem value="typescript">

  ```js
  import { createInteractor, fillIn } from 'bigtest';

  export const TextField = createInteractor<HTMLInputElement>('my-textfield-interactor')
    .selector('input[type=text]')
    .locator((element) => element.placeholder)
    .filters({
      value: (element) => element.value
    })
    .actions({
      fillIn: (interactor) => interactor.perform(fillIn)
    });
  ```

  </TabItem>
</Tabs>

:::note
 `fillIn` is a function exported by `bigtest`. See the implementation [here](https://github.com/thefrontside/bigtest/blob/v0/packages/interactor/src/fill-in.ts). You can use any of the functions defined by BigTest or implement your own.
:::

:::note Cypress
If you're using Cypress, all of the built-in Interactors and Interactor functions will need to be imported from `@bigtest/cypress` and not `bigtest`.
:::

In this example, we've configured the selector as `input[type=text].my-input` which will search for all `<input type=‘text' class=“my-input”>` elements in your testing environment. Filters and locators are then used to narrow down the list of results.

The string argument, the label, to `createInteractor()` is the name of the interactor your console will print if there's a failing test:

```
NoSuchElementError: did not find my-textfield-interactor "USERNAME"
```
_An example of the console output when a test is unable to locate the interactor_

Locators, filters, and actions are optional when creating your own interactor. While the locator for the `TextField` interactor offered by BigTest uses the `textContent` of the associated label (as we explained on the [Locators, Filters, and Actions page](/docs/interactors/locators-filters-actions#filters)), the example above has its locator configured as `element.placeholder`. This is just to demonstrate that you can set the properties of Locators to anything that suits your needs. If you create an interactor without a locator, it will default to `locator: element => element.textContent`.

You might be wondering what `interactor.perform()` does: it is a method on the interactor which ensures that there are no race conditions when working directly with elements. You can use it like this:

```js
createInteractor('my interactor')
  .actions({
    async click(interactor){
      await interactor.perform(element => element.click());
    }
  });
```

Or you could use destructuring to make it a bit shorter:

```js
createInteractor('my interactor')
  .actions({
    click: ({ perform }) => perform(element => element.click())
  });
```

The former syntax is necessary if you want to write an action that delegates to the actions of other interactors. For example, imagine that you want to create a form interactor that has a submit action. You could take this approach:

<Tabs
  defaultValue="npm"
  values={[
    {label: 'Javascript', value: 'javascript'},
    {label: 'Typescript', value: 'typescript'}
]}>
  <TabItem value="javascript">

  ```js
  import { Button, createInteractor } from 'bigtest';

  export const Form = createInteractor('form')
    .selector('form')
    .actions({
      async submit(interactor){
        await interactor.find(Button('Submit')).click();
      }
    });
  ```

  </TabItem>
  <TabItem value="typescript">

  ```js
  import { Button, createInteractor } from 'bigtest';

  export const Form = createInteractor<HTMLFormElement>('form')
    .selector('form')
    .actions({
      async submit(interactor){
        await interactor.find(Button('Submit')).click();
      }
    });
  ```

  </TabItem>
</Tabs>

There’s two peculiarities about this example. First, notice we’re not using `perform` which means that we’re not performing an action on any element directly. Secondly, within the submit action definition you’ll notice that we’re using `find` to access another Interactor and calling its action. That’s what we mean with ‘delegating’ an action.

Why would you want to delegate actions within an Interactor action definition? Well, it can help you avoid repeating yourself and to keep Interactors as black boxes. For example, let’s say we wanted to test that a user submits a form, without delegation we can reach in in the Form Interactor and issue a click action:

```js
Form().find(Button('Submit')).click();
```

But if the Form component changes and now the button that submits is no longer `Submit` but `Send` we’d have to update all our tests to reflect that change. Instead we can encapsulate that detail in the `submit` action of `Form` and delegate the click action to the responsible party. Instead of reaching into internal component elements, who ever is using Form to test the form simply as:

```js
Form().submit();
```

Let's get back to our example and add the new TextField interactor to a test. In this example we are testing an email subscription form by first filling in the email text field, clicking the `Subscribe` button, and then asserting for the success header.

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
    });
  });
  ```

  </TabItem>
  <TabItem value="cypress">

  ```js
  import { Button, Heading } from '@bigtest/cypress';
  import { TextField } from './MyTextField';

  describe('email subscription form', () => {
    beforeEach(() => cy.visit('/'));

    it('fill and submit email address', () => {
      cy.do([
        TextField('EMAIL').fillIn('batman@gmail.com');
        Button('Subscribe').click();
      ]);
      cy.expect(Heading('Success'))
    });
  });
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

The [TextField](https://github.com/thefrontside/bigtest/blob/v0/packages/interactor/src/definitions/text-field.ts) interactor from BigTest can do a lot more than this, but the example we just wrote is a good place to start when it comes to understanding how to use `createInteractor`.

Check out the source code of [createInteractor()](https://github.com/thefrontside/bigtest/blob/v0/packages/interactor/src/create-interactor.ts) for more details.

## Writing a more complex interactor

One of the greatest benefits of Interactors is that you can turn complex testing scenarios into readable assertions. Let’s illustrate how that looks like with an historically cumbersome UI piece: a table. We want to be able to easily assert the contents of our tables, and that means that we should be able to know the value in a cell given its column and row. Once we’re done creating a TableCell Interactor, we’ll be able to make that happen and have it look like this:

```js
TableCell({ columnTitle: 'Name', rowNumber: 2 }).has({ value: 'Marge Simpson' });
```

First, consider some table markup defined as follows:

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
import { createInteractor } from 'bigtest';

export const TableCell = createInteractor('table cell')
  .selector('[role=gridcell]')
  .filters({
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
  });
```

:::note Check your node version
 This example uses [optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) which is available in Node >=14.
:::

You'll notice we created `columnTitle` and `rowNumber` filters that will access its parent elements to get the appropriate value we're looking for. The locator was not specified, so it will default to `element.textContent`. We can now effectively use the TableCell interactor as we stated in the beginning of this page:

```js
TableCell({ columnTitle: 'Name', rowNumber: 2 }).has({ value: 'Marge Simpson' });
```

Now that we have the TableCell Interactor ready, let’s put it in action to test a Jeopardy chart where we have multiple tablecells with similar values. We want to make sure that the $600 cell under ‘Politics’ of our Jeopardy table disappears when we click it. The following example shows how our new TableCell interactor makes that task trivial:

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

With some thinking beforehand about how to test a data-driven UI, you can write interactors and tests that can be quickly modified as changes occur over the lifetime of your app. The BigTest Interactor approach is flexible and can handle changes like adding new columns, rearranging the order, inserting table headings, and more.

## Chaining interactors together

One more building block available to you is the `find` method, which helps you chain interactors together. `find` returns a new interactor scoped within the current interactor, and is generally used for composing actions from primitives.

Take for example the following DatePicker Interactor, in which we define an `open` action. We use `find` to target a button within `DatePicker`:

```js
createInteractor('DatePicker')
  .actions({
    open: (interactor) => interactor.find(Button).click()
  });
```

You can also use the `find` method in your tests. Say you want to test a click on the 31st day of your DatePicker. Instead of creating an action for that event, we can reach into DatePicker and target the Button element with text `31` with `find`:

```js
DatePicker().find(Button('31')).click();
```

## Common questions

### When should I write a new Interactor instead of using the Built In DOM interactors?

If the built-in DOM Interactors work for your use case, they are probably the best choice.
They are maintenance-free and support the most common user actions.

When the built-in Interactors are not enough, we encourage you to write your own. They will help prevent duplicated logic in your tests, and if your interface changes, you only need to make changes to the Interactor instead of throughout the code.

For example, let's say that you want to replace a custom datepicker with a popular third-party library instead. Although you may have many tests for flows with the date picker, only your Interactor needs to change.

### I have an interaction that is really difficult to test. What should I do?

A good test suite helps you uncover hidden problems. Often, difficult UI tests are your early warning system for areas of your app that may have accessibility issues.

The first step is to see if you can go through the interaction yourself in the browser by using only [keyboard navigation](https://webaim.org/techniques/keyboard/).
If you cannot get to the end successfully, then you just found a bug in your app.
Although many people navigate an interface by sight and clicking,
others may use assistive technology such as screen readers and keyboard support is critical.
For example, a click can mistakenly be attached to a `div` instead of a button. Those types of errors can make your app unusable to some people and also difficult to test.

Another way to find some bugs is to use automated tools such as [Lighthouse](https://github.com/GoogleChrome/lighthouse) to find problems in your HTML markup like missing input labels or misconfigured `aria` attributes.

## Up Next

Now that you’ve seen some of the power of Interactors, you’ll be happy to know that you can start using them right now in your current test suite. Interactors are compatible with several test runners, and we’ve made it particularly easy for you to plug them into your [Jest and Cypress](/docs/interactors/integrations) setups.
