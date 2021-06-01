import { Button, Heading, Link, Page, test } from 'bigtest';

export default test('Interactors with BigTest')
  .step(Page.visit('/'))
  /* pause before child? */
  .child('click sign in button', test => test
    /* pause before step? */
    .step(Button('SIGN IN').click())
    .assertion(
      Button('SIGN IN').absent(),
      Button('LOG OUT').exists()))
  .child('navigate to about page', test => test
    .step(Link('/about').click())
    .assertion(Heading('About page').exists())
    .child('navigate back to home', test => test
      .step(Link('/home').click())
      .assertion(
        Heading('Home page').exists(),
        /* pause between two assertions */
        Button('SIGN IN').exists())
      /* pause after assertion? */
      .child('toggle sign in button twice', test => test
        .step(
          Button('SIGN IN').click(),
          /* pause between steps */
          Button('LOG OUT').click(),
          Button('SIGN IN').click())
        .assertion(Button('LOG OUT').exists()))));
