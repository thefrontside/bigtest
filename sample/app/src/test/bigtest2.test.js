import { Button, Page, test } from 'bigtest';

export default test('second bigtest test file')
  .step(Page.visit('/'))
  .child('click sign in button', test => test
    .step(Button('SIGN IN').click())
    .assertion(
      Button('SIGN IN').absent(),
      Button('LOG OUT').exists()))
