import { Button } from '../../src';

describe('Cypress with Interactors', () => {
  beforeEach(() => {
    cy.visit('/');
  })
  it('single interactor per command', () => {
    cy
      .do(Button('SIGN IN').click())
      .expect(Button('LOG OUT').exists())
  });
  it('array of interactors', () => {
    cy
      .do([
        Button('SIGN IN').click(),
        Button('LOG OUT').click()
      ])
      .expect([
        Button('SIGN IN').exists(),
        Button('LOG OUT').absent()
      ]);
  })
});
