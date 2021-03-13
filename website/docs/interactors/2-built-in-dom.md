---
id: built-in-dom
title: Built-in Interactors
---

Built-in Interactors cover some of the most common UI testing needs for apps that run in the browser.

These are the default interactors that are offered out-of-the-box with BigTest:

- [Button](https://github.com/thefrontside/bigtest/blob/v0/packages/interactor/src/definitions/button.ts)
- [CheckBox](https://github.com/thefrontside/bigtest/blob/v0/packages/interactor/src/definitions/check-box.ts)
- [Heading](https://github.com/thefrontside/bigtest/blob/v0/packages/interactor/src/definitions/heading.ts)
- [Link](https://github.com/thefrontside/bigtest/blob/v0/packages/interactor/src/definitions/link.ts)
- [MultiSelect](https://github.com/thefrontside/bigtest/blob/v0/packages/interactor/src/definitions/multi-select.ts)
- [Page](https://github.com/thefrontside/bigtest/blob/v0/packages/interactor/src/page.ts)
- [RadioButton](https://github.com/thefrontside/bigtest/blob/v0/packages/interactor/src/definitions/radio-button.ts)
- [Select](https://github.com/thefrontside/bigtest/blob/v0/packages/interactor/src/definitions/select.ts)
- [TextField](https://github.com/thefrontside/bigtest/blob/v0/packages/interactor/src/definitions/text-field.ts)

As you might have seen on the [Quick Start](/docs/interactors/) page, you can import any of the interactors directly from the `bigtest` package:

```js
import { Button, TextField } from 'bigtest';
```

Follow the links above to get more information on how to use these interactors to test your app.

If your app has unique interfaces that are not covered by these built-in tools, you are encouraged to [write your own interactors](/docs/interactors/write-your-own).

### Page
The `Page` interactor is unique. Unlike Big Test’s other built-in interactors, it's not designed to target one specific element but rather the whole page. It is useful for asserting for the url or title in your test environment:

```js
Page.has({ title: 'BigTest Example App' });
```
_The `Page` interactor is instantiated differently than the other built-in interactors so you do not need to call it `Page()` unless you want to pass in an argument._

:::note Heads up
We introduced `.exists()` and `.absent()` in the [Quick Start](/docs/interactors/) section but there are also `.has()` and `.is()` Interactor assertion methods. We will discuss their details on the [Matchers and Assertions](/docs/interactors/matchers-assertions) page.
:::

And when using BigTest runner, the Page interactor can be used to navigate between routes:

```js
import { Page, test } from 'bigtest';

export default test('BigTest Runner')
  .step(Page.visit('/contact'))
  .assertion(Page.has({ title: 'BigTest Example App'}));
```

## Up Next

What are the pieces that make up an interactor? Locators and filters help you find things in the UI and make assertions. Actions advance the state of your app. Keep reading on the [Locators, Filters, and Actions](/docs/interactors/locators-filters-actions) page to learn more.
