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

As you might have seen in the [Quick Start](1-quick-start.md) section, you can import any of the interactors directly from the `bigtest` package:

```js
import { 
  Button, 
  TextField, 
} from 'bigtest';
```

Follow the links to the API documentation above for how to use each of these interactors to test your app.

If your app has unique interfaces that are not covered by these built-in tools, you are encouraged to [write your own interactors](4-write-your-own.md).

<!-- ### Page Interactor -->
<!-- 
write about page interactor here and also mention how it's more for the bigtest platform
-->

### Up Next

Every interactor has some things in common, whether it is built in or you wrote it yourself. In the next section, we will have a closer look at what locators, filters, and actions are. 
