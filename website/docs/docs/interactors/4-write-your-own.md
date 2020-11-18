---
id: write-your-own
title: Writing Interactors
---

The Interactors that are offered out of the box are there for your convenience, but you can construct your own Interactors and use those instead.

Let's go ahead and create a simple `checkbox` interactor and add it to our tutorial test:
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

_This was just for demonstration purposes as the [checkbox](/) interactor from bigtest is much more extensive and it's probably not great to use the classname property as a locator._

Check out the API section to see the details of [createInteractor()](/).
