---
id: built-in-dom
title: Built-in Interactors
---

Built-in Interactors cover some of the most common UI testing needs for apps that run in the browser.

These are the default interactors that are offered out-of-the-box with BigTest:

- [Button](/docs/interactors/api/variables/button)
- [CheckBox](/docs/interactors/api/variables/checkbox)
- [Heading](/docs/interactors/api/variables/heading)
- [Link](/docs/interactors/api/variables/link)
- [MultiSelect](/docs/interactors/api/variables/multiselect)
- [Page](/docs/interactors/api/variables/page)
- [RadioButton](/docs/interactors/api/variables/radiobutton)
- [Select](/docs/interactors/api/variables/select)
- [TextField](/docs/interactors/api/variables/textfield)

As you might have seen on the [quick start](/docs/interactors/) page, you can import any of the interactors directly from the `bigtest` package:

```js
import { Button, TextField } from 'bigtest';
```

Follow the links to the API documentation above for how to use each of these interactors to test your app.

If your app has unique interfaces that are not covered by these built-in tools, you are encouraged to [write your own interactors](/docs/interactors/write-your-own).

### Page
The `Page` interactor is special in that, unlike the other interactors, it's not to target one specific element but the whole page. It is useful for asserting for the url or title in your test environment:

```js
Page.has({ title: 'BigTest Example App' });
```
_The `Page` interactor is instantiated differently than the other built-in interactors so you do not need to call it `Page()` unless you want to pass in an argument._

> We've introduced `.exists()` and `.absent()` in the previous section but there are also `.has()` and `.is()` Interactor assertion methods. We will discuss its details on the [locators filters actions](/docs/interactors/locators-filters-actions) page.

And when using BigTest platform, the Page interactor can be used to navigate between routes:

```js
import { Page, test } from 'bigtest';

export default test('BigTest Platform')
  .step(Page.visit('/contact'))
  .assertion(Page.has({ title: 'BigTest Example App'}));
```

### Up Next

What are the pieces that make up an interactor? Locators and filters help you find things in the UI and make assertions. Actions advance the state of your app. Keep reading to learn more.
