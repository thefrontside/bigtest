---
id: matchers-assertions
title: Matchers and Assertions
---

## Matchers

## Assertions
In the [Quick Start](/docs/interactors/#making-test-assertions) we briefly touched on the assertion methods that are available for all interactors - `exists()` and `absent()`. There is also `has()` which allows you pass in a filter as its argument.

:::note
These different assertion methods are equivalents of Jest's `expect` and Cypress' `should`. When refactoring your test with Interactors, you would replace those constructs with the interactors' assertion methods.
:::

In the case of a form with textfields, you would assert the placeholder against a textfield like this:

```js
TextField({ id: 'username-id' }).has({ placeholder: 'USERNAME' });
```

The difference between this approach and using `exists()` is that `exists()` is less refined as it will succeed as long as there is at least one match. With the two textfields for the username and password, the assertion would fail on if we were to write a test like this:

```js
TextField().has({ placeholder: 'USERNAME' });
```

It would fail on account of the textfield that has the placeholder value `PASSWORD`. You therefore need to choose the assertion method that is most appropriate for your tests.

Lastly, there is also the `is()` method, which works just as `has()` does. The only difference is in the semantics so that your tests can read better.

For instance, if we wanted to test if a textfield is visible, `has()` would work perfectly fine; but writing the test using `is()` would look more natural like this:

```js
TextField({ id: 'username-id' }).is({ visible: true });
```

It makes more sense to say "text field _is_ visible" rather than "text field _has_ visible". Generally, we recommend using `is()` if your assertion is an adjective, and use `has()` if your assertion is a noun. For example, if we wanted to assert for `visibility`, then it would sound more natural to use `has()` instead:

```js
TextField({ id: 'username-id' }).has({ visibility: true });
```

## Up Next

By now you should have a much better understanding of how to locate, interact with, and make assertions with Interactors. But what if you keep running into a combination of locators, filters, and actions across your UI? [Writing your own Interactors](/docs/interactors/write-your-own) allows you to package a simple and reusable way of testing a component or element that you and your team can use in their test suites.
