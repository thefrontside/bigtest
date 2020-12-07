---
id: built-in-dom
title: Built-in Interactors
---

Built-in Interactors cover some of the most common UI testing needs for apps that run in the browser.

These are the default interactors that are offered out-of-the-box with BigTest:

- [Button](/)
- [CheckBox](/)
- [Heading](/)
- [Link](/)
- [MultiSelect](/)
- [Page](/)
- [RadioButton](/)
- [Select](/)
- [TextField](/)

As you might have seen on the [quick start](/docs/interactors/) page, you can import any of the interactors directly from the `bigtest` package:

```js
import { 
  Button, 
  TextField, 
} from 'bigtest';
```

Follow the links to the API documentation above for how to use each of these interactors to test your app.

If your app has unique interfaces that are not covered by these built-in tools, you are encouraged to [write your own interactors](/docs/interactors/write-your-own).

### Page
The `Page` interactor is special in that, unlike the other interactors, it's not to target one specific element but the whole page. It is useful for asserting for the url or title in your test environment:

```js
Page({ url: 'localhost:3000' }).exists();
```

And when using BigTest platform, the Page interactor can be used to navigate between routes:

```js
import { Page, test } from 'bigtest';

export default test('BigTest Platform')
  .step(Page.visit('/contact'))
  .assertion(
    Page({ url: 'localhost:3000/contact' }).exists());
```

### Up Next

Every interactor has some things in common, whether it is built in or you wrote it yourself. In the next section, we will have a closer look at what locators, filters, and actions are. 
