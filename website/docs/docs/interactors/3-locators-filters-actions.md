---
id: locators-filters-actions
title: Locators, Filters, and Actions
---

All interactors have some things in common, whether they are built-in or written by you. They each can have locators, filters, and actions.
In this section, you will learn what these are and some more details about how to use them.

## Locators

One benefit of Interactors is that they help you align your tests with how a user actually interacts with the app, starting with finding what to click on.
Locators are the most common way to find a specific element in a user interface.

Whenever you use an Interactor in a test, you can pass it a string, like "Submit" in the example below. This string argument is used by the Locator.

```js
Button('Submit').exists();
```

A typical user would try to find a button with the word "Submit" on it, and so we use that word for the Locator.

What is going on behind the scenes? Just like the user, the built-in Button interactor provided by BigTest looks for a button with the "Submit" text. It uses [element.textContent](/) to find the match. To say it another way, `Button('Submit')` returns a button element whose `element.textContent` is equal to `Submit`.

### Locators are optional

Sometimes, there may be only one element that matches an interactor.
In those cases, you could omit the locator.

For example, if there was only one button 
rendered in a test, you could reference it like this:

```js
Button().exists();
```

If there were multiple buttons, you would need to use a locator or filter to distinguish between them.

## Filters

Another way of narrowing down the element that you want to reference is with Filters. Filters are an object passed to an interactor, like the object with `id` in the example below:

```js
MyInteractor('Some locator text', { id: 'my-id' }).exists();
```

Why are Filters useful? Imagine we have a form with multiple `Submit` buttons:

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

If you take a look at the [button API](/), you'll see that the button interactor provides five different filters: `title`, `id`, `visible`, `disabled`, and `focused`.

You can add multiple filters to your own Interactors, as covered in the next article.


### Filters can be used on their own

If you prefer, you can omit the locator and just use a filter:

```js
Button({ id: 'submit-button-1' }).exists();
```

### What can you use for a filter?

The filters available are defined by each interactor, so look at the API docs for the built-in interactors or the code for your own interactors to know what is available.

One limitation is that mutable APIs such as `NodeList` cannot be used in a filter.

## Actions

Actions are events that simulate real user interaction. In this example, the Action is `click`:

```js
Button('Submit').click();
```

The `Button` Interactor created by BigTest comes with `click`, `focus`, and `blur` actions. You can add more actions to suit your needs when you create your own Interactors, which we will cover in the next section.

## find

Some interactors use the `find` method to chain interactors together. It returns a new interactor scoped within the current interactor, and is generally used for composing actions from primitives:

```js
createInteractor('DatePicker')({
  actions: {
    open: (picker) => picker.find(Button).click()
  }
});
```