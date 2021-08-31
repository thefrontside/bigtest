---
id: storybook-mui
title: Storybook & Material UI
---

## Storybook

Interactors not only make writing tests easier, it can also help you develop UI components. With the upcoming release of [`Component Story Format 3.0`](https://storybook.js.org/blog/component-story-format-3-0/), you will be able to use Interactors in [`Storybook`](https://storybook.js.org/).

This requires no additional setup. Just install `@interactors/html` to your project, and then you can use interactors in your stories immediately.

In the same way Interactors make tests more reliable and easier to read, it will also enhance your developer experience with Storybook.

Here is an example of how you would normally write a story:

```js
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

export const FormSignIn = {
  play: async () => {
    await userEvent.type(screen.getById('email'), 'homer@gmail.com');
    await userEvent.type(screen.getById('password'), 'donuts123');
    await userEvent.click(screen.getByText('Sign In'));
  }
};
```

And this is the same story but written with interactors:

```js
import { Button, TextField } from '@interactors/html';

export const FormSignIn = {
  play: async () => {
    await TextField('Email').fillIn('homer@gmail.com');
    await TextField('Password').fillIn('donuts123');
    await Button('Sign In').click();
  }
};
```

## Material UI

If your application is designed using [`Material UI`](https://material-ui.com/), we have already written interactors for each `Material UI` component so that you do not have to.

There is no longer a need to write complex query selectors or search for components by class; just import the corresponding `Material UI` components from the `material-ui-interactors` package and start writing your tests - it's that simple.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  groupId="runner"
  defaultValue="jest"
  values={[
    {label: 'Jest', value: 'jest'},
    {label: 'Cypress', value: 'cypress'},
    {label: 'BigTest (alpha)', value: 'bigtest'}
]}>
  <TabItem value="jest">

  ```js
  import React from 'react';
  import { render } from '@testing-library/react';
  import App from './App';

  import { Button } from 'material-ui-interactors';

  describe('Material UI with Interactors in Jest', () => {
    beforeEach(() => render(<App />));

    it('clicks Material UI Button', async () => {
      await Button('Sign In').click();
    });
  });
  ```

  </TabItem>
  <TabItem value="cypress">

  ```js
  import { Button } from 'material-ui-interactors';

  describe('Material UI with Interactors in Cypress', () => {
    beforeEach(() => cy.visit('/'));

    it('clicks Material UI Button', () => {
      cy.do(
        Button('Sign In').click();
      );
    });
  });
  ```

  </TabItem>
  <TabItem value="bigtest">

  ```js
  import { Page, test } from 'bigtest';

  import { Button } from 'material-ui-interactors';

  export default test('BigTest')
    .step(
      Page.visit('/'),
      Button('Sign In').click())
    .assertion(Button('Log out').exists());
  ```

  </TabItem>
</Tabs>

### Material UI & Storybook

Naturally, with the support of Interactors for both `Material UI` and `Storybook`, the three libraries will work together seamelessly. As we have mentioned earlier, `Storybook` will soon be releasing [`Component Story Format 3.0`](https://storybook.js.org/blog/component-story-format-3-0/) with which you will be able to use interactors. 

Below is an example of how you would use `Material UI` interactors to write stories. It is very similar to an example we showed earlier with just the import source changed from `@interactors/html` to `material-ui-interactors`:

```js
import { Button, TextField } from 'material-ui-interactors';

export const FormSignIn = {
  play: async () => {
    await TextField('Email').fillIn('homer@gmail.com');
    await TextField('Password').fillIn('donuts123');
    await Button('Sign In').click();
  }
};
```
