/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="cypress" />
// import { Interaction, ReadonlyInteraction } from '../interaction';

declare namespace Cypress {
  interface Chainable<Subject> {
    // do(interaction: Interaction<void> | Interaction<void>[]): Chainable<Subject>;
    do(interaction: any): Chainable<Subject>;
    // expect(interaction: ReadonlyInteraction<void> | ReadonlyInteraction<void>[]): Chainable<Subject>;
    expect(interaction: any): Chainable<Subject>;
  }
}