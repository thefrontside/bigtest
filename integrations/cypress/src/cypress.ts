/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
import { bigtestGlobals, RunnerState } from '@bigtest/globals';
import { Interaction, isInteraction, ReadonlyInteraction } from '@bigtest/interactor';

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      do(interaction: Interaction<void> | Interaction<void>[]): Chainable<Subject>;
      expect(interaction: ReadonlyInteraction<void> | ReadonlyInteraction<void>[]): Chainable<Subject>;
    }
  }
}

Object.defineProperty(bigtestGlobals, 'document', {
  get: () => cy.$$('body')[0].ownerDocument
});

function interact(
  interaction: Interaction<void> | ReadonlyInteraction<void>,
  runnerState: RunnerState
) {
  bigtestGlobals.runnerState = runnerState;
  return cy.then(() => {
    return interaction;
  }).then(() => {
    Cypress.log({
      displayName: runnerState,
      message: interaction.description
    });
  })
};

function isInteractions(interactions: unknown[]): interactions is ReadonlyInteraction<void>[] {
  return interactions.every(interaction => typeof interaction == 'object' && interaction != null && isInteraction in interaction)
}

if (typeof Cypress !== 'undefined' ) {
  Cypress.Commands.add('do', (
    interaction: Interaction<void> | Interaction<void>[]
  ) => {
    if(Array.isArray(interaction)){
      interaction.map(interaction => interact(interaction, 'step'));
    } else {
      interact(interaction, 'step');
    }
  });

  // NOTE: Save the original `expect` assertion method
  let chaiExpect = cy.expect as (value: unknown) => unknown

  // NOTE: Add interaction assertion function, Cypress also overrides `expect` method to a wrapper function
  Cypress.Commands.add('expect', (
    interaction: ReadonlyInteraction<void> | ReadonlyInteraction<void>[]
  ) => {
    let interactions = Array.isArray(interaction) ? interaction : [interaction]
    interactions.map(interaction => interact(interaction, 'assertion'));
  })

  // NOTE: Save the new `expect` method in which is wrapped our assertion function
  let interactionExpect = cy.expect

  // NOTE: Override Cypress's wrapper to our combined `expect`
  // @ts-expect-error TypeScript complains that signature doesn't match with declared one
  cy.expect = (
    interaction: ReadonlyInteraction<void> | ReadonlyInteraction<void>[] | unknown
  ) => {
    let interactions = Array.isArray(interaction) ? interaction : [interaction]
    if (isInteractions(interactions)) {
      return interactionExpect(interactions)
    } else {
      return chaiExpect(interaction)
    }
  }
};
