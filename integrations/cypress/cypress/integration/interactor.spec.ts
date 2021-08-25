import { Button, including, matching } from '../../src';

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
  });
  it('interactors with matchers', () => {
    cy
      .expect([
        Button(including('SIGN')).exists(),
        Button(matching(/SI(.*)IN/)).exists()
      ]);
  });
  it("cypress integration shouldn't break the built-in `should` assertion", () => {
    cy.wrap({ a: 1 }).should('eql', { a: 1 })
  });
});
