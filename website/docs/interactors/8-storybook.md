---
id: storybook
title: Storybook
---

Interactors not only make writing tests easier, it can also help you develop UI components. With the upcoming release of [`Component Story Format 3.0`](https://storybook.js.org/blog/component-story-format-3-0/), you will be able to use Interactors in [`Storybook`](https://storybook.js.org/).

This requires no additional setup. Just install `@bigtest/interactor` to your project, and then you can use interactors in your stories immediately.

In the same way Interactors make tests more reliable and easier to read, it will also enhance your developer experience with Storybook.

Here is an example of how you would normally write a story:
```js
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

export const FormSignIn = {
  play: () => {
    userEvent.type(screen.getById('email'), 'homer@gmail.com');
    userEvent.type(screen.getById('password'), 'donuts123');
    userEvent.click(screen.getByText('Sign In'));
  }
};
```

And this is the same story but written with interactors:
```js
import { Button, TextField } from '@bigtest/interactor';

export const FormSignIn = {
  play: async () => {
    await TextField('Email').fillIn('homer@gmail.com');
    await TextField('Password').fillIn('donuts123');
    await Button('Sign In').click();
  }
};
```
