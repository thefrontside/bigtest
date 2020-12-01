import { Button } from 'bigtest';

describe('Cypress with Interactors', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.expect(Button('SIGN IN').exists())
  });
});