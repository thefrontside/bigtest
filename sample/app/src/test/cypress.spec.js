import { Button, Heading, Link } from '@bigtest/cypress';

describe('Interactors with Cypress', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  it('click sign in button', () => {
    cy.do(Button('SIGN IN').click());
    cy.expect(
      Button('SIGN IN').absent(),
      Button('LOG OUT').exists());
  });
  it('navigate to about page', () => {
    cy.do(Link('/about').click());
    cy.expect(Heading('About page').exists());
  });
});
