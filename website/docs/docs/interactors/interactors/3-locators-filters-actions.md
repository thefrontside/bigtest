---
id: locators-filters-actions
title: locators filters actions
---
<!-- 
- 1-2 sentences of what they are
- One example
- What someone will learn
- In-depth content 
-->

## Locators
The string argument you pass in the interactor is its locator. The Button interactor created by bigtest has its locator as [element.textContent](/) meaning `Button('Submit')` would return a button element whose `element.textContent` is equal to `Submit`:
```js
Button('Submit').exists();
```

However, passing in a locator value is not mandatory. Often times specifying a locator is helpful because you'll receive an error when an interactor returns more than one element. But if say you only have one button on your app, you could reference it by doing this:
```js
Button().exists();
```

## Filters
Another way of narrowing down the element that you want to reference is with filters. Again, if you take a look at the [button API](/), you'll see that the button interactor was constructed with five different filters: `title`, `id`, `visible`, `disabled`, and `focused`.

Say if we have multiple `Submit` buttons:
```html
<div>
  <button id='submit-button-1'>Submit</button>
  <button id='submit-button-2'>Submit</button>
</div>
```
Using an interactor with only the locator specified would return two elements and cause an error so you would want to narrow it down further using its id filter:
```js
Button('Submit', { id: 'submit-button-1' }).exists();
```
Or you could even omit the locator and just use the filter:
```js
Button({ id: 'submit-button-1' }).exists();
```

## Actions
Actions are events that can be invoked to simulate real user interaction. 
```js
Button('Submit').click();
```
The button interactor created by bigtest comes with `click`, `focus`, and `blur` actions but you can add more actions to suit your needs when you create your own interactors which we will cover in the next section.