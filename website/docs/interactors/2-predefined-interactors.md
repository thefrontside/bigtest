---
id: predefined-interactors
title: Predefined Interactors
---

Predefined interactors cover some of the most common UI testing needs for apps that run in the browser.

These are the default interactors that are offered in `@interactors/html`:

- [Button](https://github.com/thefrontside/interactors/blob/main/packages/html/src/definitions/button.ts)
- [CheckBox](https://github.com/thefrontside/interactors/blob/main/packages/html/src/definitions/check-box.ts)
- [FormField](https://github.com/thefrontside/interactors/blob/main/packages/html/src/definitions/form-field.ts)
- [Heading](https://github.com/thefrontside/interactors/blob/main/packages/html/src/definitions/heading.ts)
- [Link](https://github.com/thefrontside/interactors/blob/main/packages/html/src/definitions/link.ts)
- [MultiSelect](https://github.com/thefrontside/interactors/blob/main/packages/html/src/definitions/multi-select.ts)
- [Page](https://github.com/thefrontside/interactors/blob/main/packages/html/src/page.ts)
- [RadioButton](https://github.com/thefrontside/interactors/blob/main/packages/html/src/definitions/radio-button.ts)
- [Select](https://github.com/thefrontside/interactors/blob/main/packages/html/src/definitions/select.ts)
- [TextField](https://github.com/thefrontside/interactors/blob/main/packages/html/src/definitions/text-field.ts)

As you might have seen on the [Quick Start](/docs/interactors/) page, you can import any of the interactors directly from the `@interactors/html` package:

```js
import { Button, TextField } from '@interactors/html';
```

If your app has unique interfaces that are not covered by these built-in tools, you are encouraged to [write your own interactors](/docs/interactors/write-your-own).

### Page

The `Page` interactor is unique. Unlike the other predefined interactors, it's not designed to target one specific element but rather the whole page. It is useful for asserting for the url or title in your test environment:

```js
Page.has({ title: 'BigTest Example App' });
```
_The `Page` interactor is instantiated differently than the other predefined interactors so you do not need to call it `Page()` unless you want to pass in an argument._

:::note Heads up
We introduced `.exists()` and `.absent()` in the [Quick Start](/docs/interactors/) section but there are also `.has()` and `.is()` Interactor assertion methods. We will discuss their details on the [Assertions](/docs/interactors/assertions) page.
:::

And when using the BigTest runner, the Page interactor can be used to navigate between routes:

```js
import { test } from 'bigtest';
import { Page } from '@interactors/html';

export default test('BigTest Runner')
  .step(Page.visit('/contact'))
  .assertion(Page.has({ title: 'BigTest Example App'}));
```

## More Interactors

There are organizations that have already adopted interactors. With their permission we are able to share their interactors as they may be helpful to you.

### FOLIO

FOLIO uses interactors for testing their `Stripes` components. You can browse through their catalog of UI components [here](https://github.com/folio-org/stripes-components/tree/master/lib). 

Click on any of the folders to see the component itself for reference. And within each component folder, you'll find a `test/` directory where they have written an interactor for the respective component and corresponding tests where they use the interactor.

For example:

```
stripes-component/lib/
  Accordion/
    Accordion.js           <= UI component
    tests/
      interactor.js        <= Interactor for the component
      Accordion-test.js    <= Tests using interactor
```

:::note
They are using Mocha to test their components, but interactors can be used in a wide variety of testing frameworks as long it relies on DOM or a simulated DOM. Read more about it on the [Jest & Cypress](/docs/interactors/integrations) page.
:::

### Material-UI

If you use [`Material UI`](https://material-ui.com/) to design your apps, we have some great news! The interactors for each Material UI components have already been written. You can see each of those interactors [here](https://github.com/thefrontside/material-ui-interactors/tree/v4/src).

On our [Storybook & Material UI](/docs/interactors/storybook-mui) page, we show an example of how you can get started with Material UI interactors as well as discuss how it can be used to write stories in [Storybook](https://storybook.js.org/).

## Show Us Your Interactors!

If you would like to showcase your projects' interactors or if you think there any common UI components that you think should be added to the list of predefined interactors, please let us know!

You can create a pull request in our [GitHub repository](https://github.com/thefrontside/interactors) or reach out to us on our [Discord channel](https://discord.gg/r6AvtnU).

## Up Next

What are the pieces that make up an interactor? Locators and filters help you find things in the UI and make assertions. Actions advance the state of your app. Keep reading on the [Locators, Filters, and Actions](/docs/interactors/locators-filters-actions) page to learn more.
