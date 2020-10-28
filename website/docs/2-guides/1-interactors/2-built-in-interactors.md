Currently, these are the eight default Interactors that come with BigTest:
- [Button](link to source code)
- [CheckBox](link to source code)
- [Heading](link to source code)
- [Link](link to source code)
- [MultiSelect](link to source code)
- [RadioButton](link to source code)
- [Select](link to source code)
- [TextField](link to source code)

In our example test in [Writing-your-first-test], we show you how you can assert against a Heading Interactor:
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

The source code for [TextField]() and [Button]() will show that its locators are `element.labels[0].textContent` and `element.textContent` respectively. So we use our locator value to refer to the correct element and invoke one of its actions.

_In this example above we chained multiple steps together with commas. The [steps-and-assertions] section explains in-depth everything you need to know about steps and assertions._

But say if hypothetically you have multiple `Submit` buttons, you can narrow down and specify the element you want by using filters:
```js
.step(Button('Submit', { id: 'login-submit-button' }).click())
```

Or if your button is an image and does not have text content, you can omit the locator argument and just use filters:
```js
.step(Button({ id: 'login-submit-button' }).click())
```