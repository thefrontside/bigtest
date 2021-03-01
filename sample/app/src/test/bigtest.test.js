import { Button, Heading, Link, Page, test } from 'bigtest';

export default test('Interactors with BigTest')
  .step(Page.visit('/'))
  .child('click sign in button', test => test
    .step(Button('SIGN IN').click())
    .assertion(
      Button('SIGN IN').absent(),
      Button('LOG OUT').exists()))
  .child('navigate to about page', test => test
    .step(Link('/about').click())
    .assertion(Heading('About page').exists()));
