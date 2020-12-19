import { Button } from 'bigtest';

describe('Interactors with Cypress', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.expect(Button('SIGN IN').exists())
  });
});