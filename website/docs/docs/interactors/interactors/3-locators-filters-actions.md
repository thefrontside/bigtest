---
id: locators-filters-actions
title: locators filters actions
---
<!-- 
- 1-2 sentences of what they are
- One example
- What someone will learn
- In-depth content

:warning: we need to mention the caveat of how weird mutable apis like nodelist cannot be used in filters
-->

Locators, filters, and actions are the key ingredients for creating new Interactors.
In this section, you will learn what they are and some more details about how to use them.

## Locators

Locators are one of two ways to find a specific element in a user interface.

Whenever you use an Interactor in a test, you can pass it a string, like "Submit" in the example below. This string argument is the Locator.

```js
Button('Submit').exists();
```

What is going on behind the scenes? The built-in Button interactor provided by BigTest looks for a button with that test, using [element.textContent](/). So, `Button('Submit')` returns a button element whose `element.textContent` is equal to `Submit`.

### Locators are optional

Sometimes, there may be only one element that matches an interactor.
In those cases, you could omit the locator.

For example, if there was only one button 
rendered in a test, you could reference it like this:

```js
Button().exists();
```

If there were multiple buttons, you would need to use a locator to distinguish between them.

## Filters

Another way of narrowing down the element that you want to reference is with Filters. Filters are an object passed to an Interactor, like the object with `id` in the example below:

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

If we only use a Locator, we would get two elements and see an error. In this case, we cannarrow it down further using the `id` Filter provided by the BigTest `Button` Interactor:

```js
Button('Submit', { id: 'submit-button-1' }).exists();
```

If you take a look at the [button API](/), you'll see that the button interactor supports five different filters: `title`, `id`, `visible`, `disabled`, and `focused`.

You can add multiple filters to your own Interactors, as covered in the next article.

## Filters can be used on their own

If you prefer, you can omit the locator and just use a filter:

```js
Button({ id: 'submit-button-1' }).exists();
```

## Actions

Actions are events that simulate real user interaction. In this example, the Action is `click`:

```js
Button('Submit').click();
```

The `Button` Interactor created by BigTest comes with `click`, `focus`, and `blur` actions. You can add more actions to suit your needs when you create your own Interactors, which we will cover in the next section.
