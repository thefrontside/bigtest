import { Button, Page, test } from 'bigtest';

export default test('Interactors with BigTest')
  .step(Page.visit('/'))
  .step(Button('SIGN IN').exists());
