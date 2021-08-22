/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
import { bigtestGlobals, RunnerState } from '@bigtest/globals';
import { Interaction, ReadonlyInteraction } from '@interactors/html';

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

  Cypress.Commands.add('expect', (
    interaction: ReadonlyInteraction<void> | ReadonlyInteraction<void>[]
  ) => {
    if(Array.isArray(interaction)){
      interaction.map(interaction => interact(interaction, 'assertion'));
    } else {
      interact(interaction, 'assertion');
    }
  });
};
