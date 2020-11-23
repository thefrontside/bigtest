---
id: write-your-own
title: Writing Interactors
---

The Interactors that are offered out of the box are there for your convenience, but you can construct your own Interactors and use those instead.

Let's go ahead and create a simple `checkbox` interactor:
```js
import { createInteractor, perform } from 'bigtest';

export const Checkbox = createInteractor<HTMLInputElement>('checkbox')({
  selector: 'input[type=checkbox]',
  locator: (element) => element.className,
  actions: {
    click: perform((element) => { element.click(); })
  }
});
```

And now we can import the new interactor and add it to our test:
```js
import { Button, Heading, Page, test } from 'bigtest';
import { Checkbox } from './Checkbox';

export default test('bigtest todomvc')
  .step(Page.visit('/'))
  .assertion(Heading('todos').exists())
  .child('click checkbox', test => test
    .step(Checkbox('toggle').click())
    .assertion(Button('Clear completed').exists()));
```

_This was just for demonstration purposes as the [checkbox](/) interactor from bigtest is much more extensive and it's probably not great to use the classname property as a locator._ <!-- there's probably a better way to word this -->

Check out the API page of [createInteractor()](/) for more details.

<!-- 
- 1-2 sentences explaining that people should write their own interactors regularly, and why - they should do so
- One example
- What someone will learn
- Writing your first interactor
- Interactors for complex user interactions (radio button, 3rd party date picker). Make it clear here that if it’s hard to write an interactor, it might be an indicator of a problem with how something is written (like for accessibility) 
-->
