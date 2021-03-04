---
id: accessibility
title: Accessibility testing
---

Accessibility testing is an important step towards making sure that everyone can use your app, including people with disabilities. In many cases, accessibility is [required by law](https://webaim.org/articles/laws/world/), regulation, or compliance.

BigTest provides tools to help you test and maintain your app's accessibility, and catch mistakes before they go into production.
These tools are not special exceptions to how BigTest works; they are baked into its core, you can use them anywhere in your tests, and the techniques are familiar to anyone who has written a BigTest.

By the end of this guide, you will learn how to test some common accessibility features and catch mistakes.

## Inputs and labels

[Every input in your app needs an associated label](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#labels). One way you can ensure this is to use labels as the main way to locate inputs in your tests, instead of looking up an input by `id`.
The following test would fail if the input was not connected to its label.

```js
export default test('Email input')
  .step(Page.visit('/'))
  .step(TextField('Email').fillIn('something@example.com'));
```

```html
<label for="input-email">Email</label>
<input type="text" id="input-email" />
```

If you have a hard time finding an input with your interactors, you may have caught an accessibility bug!

Why use labels to find an input instead of other properties like `id` or `class`?
Whenever you are writing tests like these, it is best to test your app in the way that real humans would. They would look for a label, or listen to their screen reader prompts that tell them about it.

## Focus management

Focus lets users know what they can interact with.
A cocused element typically has a special style, such as a bold blue ring around them. The ability to jump between and identify focusable elements is critical, especially for keyboard-only users and people who use assistive tech.

Bring focus to an element:

```js
export default test('Email input')
  .step(Page.visit('/'))
  .step(TextField('Email').focus())
```

Find the input element that has focus, using the filter `{ focused: true }`:

```js
export default test('Find focused input')
  .step(Page.visit('/'))
  .step(TextField('Email').focus())
  .step(
    TextField({ focused: true })
      .fillIn('something@example.com')
  )
```

Assert that an element has focus:

```js
export default test('Focus')
  .step(Page.visit('/'))
  .step(TextField('Email').focus())
  .assertion(
    TextField('Email').is({ focused: true })
  )
```

Focus is just another property of an HTML element. Therefore, when testing for focus you can use an approach that is similar to how you would test other elements, such as whether a checkbox is checked or a button is enabled.

## Alt text

Every image in your app that has important meaning should have an alt property that describes it.

Write an interactor for images that finds them by their alt text:

```js
const Image = createInteractor('image')
  .selector('img')
  .locator((element) => element['alt'])
```

Use this new interactor to find specific images:

```js
export default test('Image')
  .step(Page.visit('/'))
  .assertion(
    Image('here is some alt text').exists()
  )
```

Again, this is a lot like testing any other property in the DOM.
In order for the test to succeed, the image must exist, which is useful to test on its own.
In this way, accessibility checks can be woven right into other feature tests without increasing the lines of code.

## Checking ARIA properties

[ARIA properties](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques) provide additional information to a browser's accessibility API, such as whether a menu is open or closed. ARIA is short for Accessible Rich Internet Applications. ARIA properties do not cause a change in the page's DOM, but they do have an effect on the experience of people who use assistive technology.

Checking if a menu is opened or closed, according to the [`aria-expanded` property](https://www.w3.org/WAI/tutorials/menus/application-menus/):

```html
<button aria-expanded="false">
  Toggle
</button>
```

Write an interactor that looks for the buttons that control toggling the open
and close of a menu:

```js
export const Toggle = createInteractor('toggle')
  .selector('button')
  .locator((element) => element.innerHTML)
  .filters({
    ariaExpanded: (element) => element.ariaExpanded
  })
```

Write an assertion using the `ariaExpanded` filter:

```js
export default test('Toggle to expand')
  .step(Page.visit('/'))
  .assertion(
    Toggle('Expand', { ariaExpanded: "false" }).exists()
  )
```

You should especially write tests for changes made to aria properties as someone interacts with the UI - the addition of alerts, the state of a progress bar, or dynamically generated aria labels.

## Checking a page title

Page titles are important for [both accessibility and SEO](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title).
Every page in your app should have a unique title.
Titles are often overlooked, especially in single page apps, and so they are great to test for!

```js
export default test('Home page')
  .step(Page.visit('/'))
  .assertion(
    Page.has({ title: 'BigTest Example App' });
  )
```


## Learning resources

When in doubt about what to test or whether something is accessible, refer back to authoritative resources on web accessibility:

- [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/) - web accessibility content guidelines
- [How to meet WCAG](https://www.w3.org/WAI/WCAG21/quickref/) - quick reference of requirements 
- [WebAIM](https://webaim.org/) - a reliable source of trainings and tutorials 

It is important to keep in mind that no automated test from any library can eliminate the need for a comprehensive review that includes [testing the screen reader experience](https://webaim.org/articles/screenreader_testing/).
Continuous integration testing is one part of the story.

## Conclusion

When you include accessibility in your testing story, you can spend more time building and less time chasing down regressions.
Furthermore, team members can discover their own knowledge gaps when a test fails, and improve their skills over time.

Building accessible user interfaces is an ongoing, daily journey. Your test suite is there for you 24/7.
