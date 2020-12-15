---
id: locators-filters-actions
title: Locators, Filters, and Actions
---

All interactors have some things in common, whether they are built-in or written by you. They have to be able to find elements in the page, manipulate them like a user would, and ultimately make assertions based on how they appear. To do these things, Interactors use locators, actions, and filters.

## Locators

One benefit of Interactors is that they help you align your tests with how a user actually interacts with the app, starting with finding what to act upon.

Locators are the simplest way to find a specific element in a user interface.

Whenever you use an Interactor in a test, you can pass it a string, like "Submit" in the example below. This string argument would be the Locator.

```js
Button('Submit').exists();
```

A typical user identifies a button by the words printed across it, so for example, they would think of a button with the word 'Submit' on it as the "Submit" button. Interactors use locators to make that connection.

<!--
🧹👆
I'd rephrase this a bit because finding buttons isn't what users do so much as identify them and divine their purpose and perhaps use an example.

Maybe "A typical user identifies a button by the words printed across it, so for example, they would think of a button with the word 'Submit' on it as the "Submit" button. Interactors use

min: i think he forgot to finish his suggestion so i filled in the blank.
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
TextField('Username:', { id: 'username-id' }).exists();
```

> The locator of the `TextField` interactor is the textContent of its associated label:
> ```html
><label>
>  Username:
>  <input type='text' id='username-id'/>
></label>
> ```
> _See the API of the TextField interactor [here](/)_.

You can think of locators as the "default filter" because filters and locators both serve the same functionality. The reason why we offer both solutions is for your convenience because having to pass in an object for each interactor can be repetitive.

So how are Filters useful? Most forms have multiple textfields and if they do not have labels or if there are multiple labels with the same value, that's when you would need to use a filter. Below is an example of a form with textfields that do not have labels:
```html
<form>
  <input id='username-id' type='text' placeholder='USERNAME'/>
  <input id='password-id' type='password' placeholder='PASSWORD'/>
</form>
```

As they do not have labels, we would not be able to use a locator in this scenario. Using `TextField()` would return two elements and therefore an error. We can narrow it down using either `id` or `placeholder` filters provided by the BigTest `TextField` interactor:

```js
TextField({ id: 'username-id' }).exists();
TextField({ placeholder: 'PASSWORD' }).exists();
```

Also, the filter object can take as many properties as you want it to:

```js
TextField({ id: 'username-id', placeholder: 'USERNAME', visible: true }).exists();
```

The filters available are defined by each interactor, so look at the API docs for the built-in interactors or the code for your own interactors to know what is available.

If you take a look at the [TextField API](/), you'll see that the TextField interactor provides eight different filters. Later you will learn how to add your own filters to Interactors.

### Asserting with filters
Filters can be very convenient for finding matching UI elements, but where they really shine is in making assertions about what you expect your application to be showing.

In the [quick start](/docs/interactors/#making-test-assertions) we briefly touched on the assertion methods that are available on all interactors, `exists()` and `absent()`. There is also `has()` which allows you pass in a filter as its argument. 

> These assertion methods are equivalanets of `expect` and `should` of Jest and Cypress respectively. When refactoring your test with Interactors, you would replace those constructs with the interactors' assertion methods.

Continuing from the last example, this is how we would assert the placeholder against a textfield:

```js
TextField({ id: 'username-id' }).has({ placeholder: 'USERNAME' });
```

The difference between this approach and using `exists()` is that `exists()` is less explicit as it will succeed as long as there is at least one match. Going back to the example of where we have two textfields with placeholders `USERNAME` and `PASSWORD`, say if we were to write a test like:

```js
TextField().has({ placeholder: 'USERNAME' });
```

This assertion would fail on account of the textfield that has the placeholder value `PASSWORD`. So you will need to choose the assertion method that is most appropriate for your tests.

Lastly, there is also the `is()` method which is identical to `has()`. The difference is only in semantics so that your tests can read better. For instance, if we wanted to test if a textfield is visible, `has()` would work perfectly fine but we could write the test using `is()`:

```js
TextField({ id: 'username-id' }).is({ visible: true });
```

## Actions

Actions are events that simulate real user interaction. In this example, the Action is `click`:

```js
Button('Submit').click();
```

The `Button` Interactor created by BigTest comes with `click`, `focus`, and `blur` actions. You can add more actions to suit your needs when you create your own Interactors. We've shown you `click` and in the next page we'll be using `fillIn` in our TextField interactor example but you can also take a look at all the other available actions in the API section.
