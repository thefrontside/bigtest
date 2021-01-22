import { Button } from '@bigtest/cypress';

describe('Interactors with Cypress', () => {
  it('Interactors with Cypress', () => {
    cy.visit('/');
    cy.do(Button('SIGN IN').click());
    cy.expect(Button('SIGN IN').absent());
  });
});