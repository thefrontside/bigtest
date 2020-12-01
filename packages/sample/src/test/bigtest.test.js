import { Button, Page, test } from 'bigtest';

export default test('bigtest todomvc')
  .step(Page.visit('/'))
  .step(Button('SIGN IN').exists());
