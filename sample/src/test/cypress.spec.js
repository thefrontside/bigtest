import { Button } from 'bigtest';

describe('Interactors with Cypress', () => {
  it('Interactors with Cypress', () => {
    cy.visit('/')
    cy.expect(Button('SIGN IN').exists())
  })
});