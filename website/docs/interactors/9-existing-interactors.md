---
id: existing-interactors
title: Existing Interactors
---

There are organizations that have already adopted interactors. With their permission we are able to share their interactors as they may be helpful to you.

## FOLIO

FOLIO uses interactors for testing their `Stripes` components. You can browse through their catalog of UI components [here](https://github.com/folio-org/stripes-testing/tree/master/interactors). 

## Material-UI

If you use [`Material UI`](https://material-ui.com/) to design your apps, we have some great news! The interactors for each Material UI components have already been written so that you do not have to create them yourself. You can see each of those interactors [here](https://github.com/thefrontside/material-ui-interactors/tree/v4/src).

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
  import { test } from 'bigtest';
  import { Page } from '@interactors/html';

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

## Show Us Your Interactors!

If you would like to showcase your projects' interactors or if you think there any common UI components that you think should be added to the list of predefined interactors, please let us know!

You can create a pull request in our [GitHub repository](https://github.com/thefrontside/interactors) or reach out to us on our [Discord channel](https://discord.gg/r6AvtnU).
