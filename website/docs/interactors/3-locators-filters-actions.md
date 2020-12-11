---
id: locators-filters-actions
title: Locators, Filters, and Actions
---

All interactors have some things in common, whether they are built-in or written by you. They each can have locators, filters, and actions. In this section, you will learn what these are and some more details about how to use them.

<!--
🧹👆
Again, I think that stating the purpose before we introduce the term is helpfuul. How about something like "All interactors have some things in common, whether they are built-in or written by you. They have to be able to find elements in the page, manipulate them like a user would, and ultimately make assertions based on how they appear. To do these things, interactors use Locators, actions, and filters"
-->

## Locators

One benefit of Interactors is that they help you align your tests with how a user actually interacts with the app, starting with finding what to click on.

<!--
🧹👆
How about "finding what to act upon?" since not every interactor has a click actions
-->

Locators are the simplest way to find a specific element in a user interface.

Whenever you use an Interactor in a test, you can pass it a string, like "Submit" in the example below. This string argument is used by the Locator.

<!--
🧹👆
I find this somewhat confusing. While "This string argument is used by the Locator" is technically correct, the follow up is then: what is a locator, and that is not really explained. Even though this is somewhat confusing, I would almost advocate to refer to the actual *value* as the locator, and so the function which is passed to the specification is a locator function and it evaluates to the locator. I think this would be easier to understand.
-->

```js
Button('Submit').exists();
```

A typical user would try to find a button with the word "Submit" on it, and so we would use that word for the Locator.

<!--
🧹👆
I'd rephrase this a bit because finding buttons isn't what users do so much as identify them and divine their purpose and perhaps use an example. Maybe "A typical user identifies a button by the words printed across it, so for example, they would think of a button with the word 'Submit' on it as the "Submit" button. Interactors use
-->

What is going on behind the scenes? Just like the user, the built-in Button interactor provided by BigTest looks for a button with the "Submit" text. It uses [element.textContent](/) to find the match. To say it another way, `Button('Submit')` returns a button element whose `element.textContent` is equal to `Submit`.

### Locators are optional

Sometimes, there may be only one element that matches an interactor. In those cases, you could omit the locator.

For example, if there was only one button rendered in a test, you could reference it like this:

```js
Button().exists();
```

If there were multiple buttons, you would need to use a locator and or filters to distinguish between them.

## Filters

Another way of narrowing down the element that you want to reference is with Filters. Filters are an object passed to an interactor, like the object with `id` in the example below:

```js
MyInteractor('Some locator text', { id: 'my-id' }).exists();
```

You can think of locators as the "default filter" because filters and locators both serve the same functionality. The reason why we offer both solutions is for your convenience because having to pass in an object for each interactor can be repetitive.

So how are Filters useful? Imagine we have a form with multiple `Submit` buttons:

```html
<div>
  <button id='submit-button-1'>Submit</button>
  <button id='submit-button-2'>Submit</button>
</div>
```

If we only use a Locator, we would get two elements and see an error. In this case, we can narrow it down further using the `id` filter provided by the BigTest `Button` interactor:

```js
Button('Submit', { id: 'submit-button-1' }).exists();
```

Or if you know the filter by itself will output one element, you can omit the locator:

```js
Button({ id: 'submit-button-1' }).exists();
```

Also, the filter object can take as many properties as you want it to:

```js
Button({
  id: 'submit-button-1',
  title: 'Sign Up Form',
  visible: true
}).exists();
```

The filters available are defined by each interactor, so look at the API docs for the built-in interactors or the code for your own interactors to know what is available.

If you take a look at the [button API](/), you'll see that the button interactor provides five different filters. You can add as many filters as you need to your own Interactors, as covered in the next article.

<!--
🧹👆
This is a bit strange, maybe something like "Later you will learn how to add your own filters to interactors", or something like that?
-->

One limitation is that mutable APIs such as `NodeList` cannot be used in a filter.

<!--
🧹👆
C: We don't fully understand this issue, but we should unpack it if we're going to reference it in a guide.
J: Is this really true?
-->

### Asserting with filters
In the [quick start](/docs/interactors/#making-test-assertions) we briefly touched on the assertion methods that are available on all interactors, `exists()` and `absent()`. There is also `has()` which allows you pass in a filter as its argument. Continuing from the last example, this is how we would assert the title against a button:

```js
Button({ id: 'submit-button-1' })
  .has({ title: 'Sign Up Form' });
```

The difference between this approach and using `exists()` is that `exists()` will succeed as long as there is at least one match. You will need to choose the assertion method that is most appropriate for your use case.

Going back to the example of where we have two Buttons with ids `submit-button-1` and `submit-button-2`, say if we were to write a test like:

```js
Button('Submit').has({ id: 'submit-button-1' });
```

<!--
🧹👆
This example doesn't seem very realistic, can we use a better example, like asserting on the value of a text field, for example?
-->

This assertion would fail on account of the button that has the `submit-button-2` id.

Lastly, there is also the `is()` method which is identical to `has()` in functionality. The difference is only in semantics so that your tests can read better. For instance, if we wanted to test if a button is visible, `has()` would work perfectly fine but we could write the test using `is()`:

```js
Button({ id: 'submit-button-1' }).is({ visible: true });
```

<!--
🧹👆
In this section, I think it would be good to really play up the importance of filters in assertions with explanatory text. Something like "filters can be very convenient for finding matching UI elements, but where they really shine is in making assertions about what you expect your application to be showing.

It also might help to include that this is the equivalent of 'expect' in Jest, and `should` in Cypress, and that whenever you use those constructs, you would instead use an interactor's filter.

Finally, the rule for when to use `is/has` needs to be fleshed out, we could even present it as a light-bulb tip or something, but the general rule is that if the filter is an adjective, then you should use `is()`, if it is a noun, then it would be `has()`. Thus, `Layout().has({ height: 200 })`, but `Layout().has({ direction: 'right-to-left'})`
-->

## Actions

Actions are events that simulate real user interaction. In this example, the Action is `click`:

```js
Button('Submit').click();
```

The `Button` Interactor created by BigTest comes with `click`, `focus`, and `blur` actions. You can add more actions to suit your needs when you create your own Interactors.

## find

Some interactors use the `find` method to chain interactors together. It returns a new interactor scoped within the current interactor, and is generally used for composing actions from primitives:

```js
createInteractor('DatePicker')({
  actions: {
    open: (picker) => picker.find(Button).click()
  }
});
```

You can also use the `find` method in your tests:

```js
DatePicker().find(Button('31')).click();
```

<!--
🧹👆
The section on `find` is in the wrong place, it should belong to "Writing interactors". In its place it would be good to have a section on using `find` to scope interactors, this is challenging since we don't currently have any built-in interactors which lend themselves to scoping, but there is one interactor we could easily add which would work well for scoping: `Fieldset`!
-->