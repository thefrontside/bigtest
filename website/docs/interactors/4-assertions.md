---
id: assertions
title: Assertions
---

This page will discuss the different ways you can assert with interactors. 

## Assertions

There are four assertion methods available on all interactors:

- `has()`
- `is()`
- `exists()`
- `absent()`

The assertion method you choose depends on what you are trying to test. Let's go through an example of each of these.

:::note
These different assertion methods are equivalents of Jest's `expect` and Cypress' `should`. When refactoring your test with Interactors, you would replace those constructs with the interactors' assertion methods.
:::

### Using `has()` to assert for one result

If you expect that an interactor will only match one element, use `has()` to make your assertion.

```js
TextField({ id: 'username-id' }).has({ placeholder: 'USERNAME' });
```

### Using `is()` for readability

The `is()` method is an alias of `has()`. It works the same way as `has()` The only difference is in the semantics so that your tests can read better.

For instance, if we wanted to test if a text field is visible, `has()` would work perfectly fine; but writing the test using `is()` would read more like a sentence:

```js
TextField({ id: 'username-id' }).is({ visible: true });
```

As a rule of thumb, use `is()` if your assertion is an adjective, and use `has()` if your assertion is a noun. For example, if we wanted to assert for `visibility`, then it would sound more natural to use `has()` instead:

```js
TextField({ id: 'username-id' }).has({ visibility: true });
```

### Using `exists()` for multiple results

Use `exists` when you expect that the interactor will find multiple results. This assertion will still pass even if there are multiple `TextField`s found.

```js
TextField().exists({ placeholder: 'USERNAME' });
```

### Using `absent()` for non-existent results

If you want to assert that something is not visible on the page, use `absent()`. For example, when someone is logged in, maybe the sign in button should be hidden:

```js
Button('Sign In').absent();
```

## Up Next

In the next page, [Matchers](/docs/interactors/matchers), we will be going over the different matchers that are offered in Interactors and ways in which you can compose your own matchers.
