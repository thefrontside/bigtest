---
id: assertions-matchers
title: Assertions and Matchers
---

## Assertions

Filters can be very convenient for finding matching UI elements, but where they really shine is in making assertions about what you expect your application to be showing.

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

## Matchers
### strings(substring?|regexp?)
including `HTML({ title: including('') })`
matching  `HTML({ title: matching(/he(llo|ck/)) })`

### iterables(matcher?)
some `MultiSelect().has({ values: some('') })`
every `MultiSelect().has({ values: every('') })`

### combinators(matcher?)
and `HTML({ title: and('', '') })`
or `HTML({ title: or('', '') })`
not `HTML({ title: not('') })`

#### questions
- do matchers only work as values of filters/locators? or can they be used AS filters/locators?
  - HTML(or({id: ''}, {title:''}))