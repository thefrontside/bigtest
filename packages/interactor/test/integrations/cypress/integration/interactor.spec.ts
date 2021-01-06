import { TextField, Heading } from '../../../../src/';

describe('Cypress with Interactors', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  it('single interactor per command', () => {
    cy
      .do(TextField().fillIn('hello'))
      .expect(TextField({ value: 'hello' }).exists());
  });
  it('array of interactors', () => {
    cy
      .do([
        TextField().fillIn('hello'),
        TextField().fillIn('bye')
      ])
      .expect([
        TextField().has({ value: 'bye' }),
        Heading('todos').exists()
      ]);
  });
});
