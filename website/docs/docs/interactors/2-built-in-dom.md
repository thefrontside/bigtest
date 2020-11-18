---
id: built-in-dom
title: Built-in Interactors
---

<!-- 
- 1-2 sentences of what they are
-->

These are the eight default interactors that come out-of-the-box with bigtest:
- [Button](/)
- [CheckBox](/)
- [Heading](/)
- [Link](/)
- [MultiSelect](/)
- [RadioButton](/)
- [Select](/)
- [TextField](/)

<!-- 
- List of all available interactors
  - there is also Page interactor but idk if that should be mentioned here 
  - Either the list above links to API or we have an example of each. Or maybe both.
    - I think a link to the API would be best
-->

As you might have seen in the [Quick Start](/) section, you can import any of the interactors directly from the bigtest package:

```js
import {
  Button,
  Heading,
  TextField
} from 'bigtest';

describe('using interactors', () => {
  it('signs in', async () => {
    await TextField('Username').fillIn('batman');
    await TextField('Password').fillIn('abc123');
    await Button('Sign In').click();
    await Heading('Welcome Batman').exists();
    await Button('Log Out').exists();
  })
})
```

<!--
- One example
  - Because the focus is on just showing people how to import, I didn't think it would be necessary to show both jest and cypress here.
  - and also we're covering locators, filters, actions in the next section so i kept the example simple.
-->

You can construct your own customer interactors which we cover in [Write Your Own Interactors](/) section. But first let's take a look at what locators, filters, and actions are. 

<!-- 
- Make sure to make it clear that people can and should write their own interactors.
-->


<!-- 
below is from original doc draft. but they're mostly bigtest-runner related and goes over an example for filters which we're doing in the next section anyway
-->

In our example test in [Writing-your-first-test](https://frontside.com/), we show you how you can assert against a Heading Interactor:
```js
import { Heading, Page, test } from 'bigtest';

export default test('bigtest todomvc')
  .step(Page.visit('/'))
  .assertion(Heading('todos').exists());
```

But you can also use Interactors to perform actions:
```js
import { Button, Page, test, TextField } from 'bigtest';

export default test('some login page')
  .step(
    Page.visit('/login'),
    TextField('Username').fillIn('Batman'),
    TextField('Password').fillIn('taxevasion123'),
    Button('Submit').click()
  )
  .assertion(Heading('Hello Batman').exists());
```

The source code for [TextField](https://frontside.com/) and [Button](https://frontside.com/) will show that its locators are `element.labels[0].textContent` and `element.textContent` respectively. So we use our locator value to refer to the correct element and invoke one of its actions.

_In this example above we chained multiple steps together with commas. The [steps-and-assertions](https://frontside.com/) section explains in-depth everything you need to know about steps and assertions._

But say if hypothetically you have multiple `Submit` buttons, you can narrow down and specify the element you want by using filters:
```js
.step(Button('Submit', { id: 'login-submit-button' }).click())
```

Or if your button is an image and does not have text content, you can omit the locator argument and just use filters:
```js
.step(Button({ id: 'login-submit-button' }).click())
