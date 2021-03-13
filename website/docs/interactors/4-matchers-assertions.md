---
id: matchers-assertions
title: Matchers and Assertions
---

The methods in which we use locators and filters, as we have illustrated in the previous page, are very explicit. There may be times when some flexibility in your interactors is necessary in order to write better tests. And that's where matchers come in. <!-- the paragraph above needs to be fact checked -->

This page will guide you on how you can utilize the matchers that are offered out-of-the-box with BigTest, and also go over how you can compose your own reusable matchers. Afterwards, we can finally look at all the different assertion methods that can be used with interactors.

## Matchers

If your tests are written against a simulated database, it might not be important what the randomized users' names are. Maybe you just want to assert for the successful login message to include the word 'welcome'. Or perhaps it does not matter what the name is but you still want to assert that a name is displayed. This is one of many situations where matchers would come in handy.

We will start by going over the two most primitive matchers: `including()` and `matching()`.

:::note
- Remember to import the matchers you want to use:
  ```js
  import { including, matching } from 'bigtest';
  ```
- Matchers are meant to be used for the _values_ of locators and filters and they cannot be substituted for the actual filters:
  ```js
  Heading().has({ id: or('foo', 'bar') }); // good
  Heading().has({ or(id: 'foo', id: 'bar') }); // bad
  ```
:::

### including, matching

The `including()` matcher invokes Javascript's `includes()` String method to check if the argument is included in the value of your interactors' locator or filter.

And `matching()` is for when you want to use regular expression instead of a string.

To illustrate how you can use these two matchers, let's take this Heading element:

```html
<h1>Foo Bar</h1>
```

Here is how you would use `including()` and `matching()` to locate the header and assert that it exists:

```js
Heading(including('Foo')).exists();
Heading(matching(/Bar$/)).exists();
```

### and, or, not
These next three matchers: `and()`, `or()`, and `not()` are different from the first two matchers in that they can take multiple arguments and the arguments can be either a value or another matcher.

For the next few examples, we'll be using these two link elements:

```html
<a href="https://google.com">Google</a>
<a href="https://twitter.com">Twitter</a>
```

Let's first see how you can combine `and()` with some of the other matchers. In this test we are checking to see if there is a link with a `href` property that starts with `https`, includes `google`, _and_ ends with `.com`:

```js
Link({ 
  href: and(
    matching(/^https/),
    including('google'),
    matching(/\.com$/)
  )
}).exists();
```

If there is no link that matches all three conditions, the test would fail on account of the interactor not returning any elements.

In this next example, we will pass in one false value to `or()`:

```js
Link('Google').has({ 
  href: or(
    'https://google.com',
    'https://twitter.com'
  )
});
```

If we tried to assert that a link with an innerText value of `Google` has a `href` property of `https://twitter.com`, it would normally fail. But we are saying it just needs to be _either_ `https://google.com` or `https://twitter.com` so the test would pass in this case.

And last but not least of the three is the `not()` matcher. This one is also pretty straight forward:

```js
Link(not('Google')).has({ href: 'https://twitter.com' });
```

:::note Reminder
With these three combinators you can choose to combine them with other matchers or just specify the full value of your locator or filter.

The common use case would be to use `and()`, `or()`, and `not()` in combination with other matchers, but there are scenarios where passing in a value might be useful.

For instance, when you need to check to see if a certain button exists in the DOM regardless of its visibility:

```js
Button({ id: 'foo', visible: or(true, false)  }).exists();
```
:::

### some, every
For when you need to assert against iterables, you will find the `some()` and `every()` matchers very helpful. We will use the [`MultiSelect`](https://github.com/thefrontside/bigtest/blob/v0/packages/interactor/src/definitions/multi-select.ts#L48) interactor for the next example because its `values` filter returns an array based on its options' labels:

```js
.filters({
  values: (e) => Array.from(e.selectedOptions).map((o) => o.label),
})
```

`some()` matcher will return true if the argument matches any one of the array items, and `every()` will return true only if all items match. We will use the select element below to demonstrate how these two matchers work:

```html
<select multiple>
  <option selected>Neon Blue</option>
  <option selected>Neon Green</option>
</select>
```

In the following tests, we're going to first assert that _some_ of the select element's options has a value that includes the word "Blue", and then assert that _every_ option starts with "Neon":

```js
MultiSelect().has({ values: some(including('Blue')) });
MultiSelect().has({ values: every(matching(/^Neon/)) });
```

In the example above we are passing in the `including()` and `matching()` matchers into `some()` and `every()`. Once again, `and()`, `or()`, `not()`, `some()`, and `every()` can take matchers as its argument. This means you can chain them together multiple times to cater to your needs.

Though the matchers are already ergonomic, you can make your tests even tidier and easier to read by creating your own matchers.

## Creating matchers
There are two ways you can write your own matcher: by piggybacking on preexisting matchers or you can create your own from scratch. We will cover both methods in this section.

Let us start by refactoring the last example by creating a matcher called `includesBlueOrGreen`:

```js
import { including, or } from 'bigtest';

export const includingBlueOrGreen = or(
  including('Blue'),
  including('Green')
);
```

You can then import and use the new matcher in your tests like so:

```js
MultiSelect().has({ values: every(includingBlueOrGreen) });
```

Composing a matcher using other matchers is convenient because it delegates most of the matcher logic as well as the error message.

To create your own matcher without the use of any of the preexisting ones, you will need to create a function that returns a `{ match(), format() }` shape object.

The `match()` function is where you place all of the matcher logic. It takes an argument which represents the values from the interactors' values. Here's how the `including()` matcher is implemented:

```js
export function including(subString) {
  return {
    match(actual) {
      return actual.includes(subString);
    },
    format() {
      return `including ${JSON.stringify(subString)}`;
    }
  };
};
```

_You can find the source code for the `including()` matcher [here](https://github.com/thefrontside/bigtest/blob/v0/packages/interactor/src/matchers/including.ts)._

And the return value from the `format()` function is to display an error message for when no interactors are found:

```
ERROR did not find heading with id including "foo" ...
```

Or for when an incorrect assertion is made:

```
ERROR heading does not match filters:

╒═ Filter:   id
├─ Expected: including "foo"
└─ Received: "bar"
```

Here is another simple example of how a matcher can be constructed:

```js
export function greaterThan(number) {
  return {
    match(actual) {
      return actual > number
    },
    format() {
      return `greater than ${number}`
    }
  };
};
```

This `greaterThan()` matcher will return true when the value of the relevant interactors' locator or filter is greater than the argument.

<!-- i think this could use a better transition here to the next section -->

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
