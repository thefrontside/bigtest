/// <reference types="cypress" />
import { bigtestGlobals, RunnerState } from '@bigtest/globals';
import { Interaction, ReadonlyInteraction } from '../interaction';

function interact(
  interaction: Interaction<void> | ReadonlyInteraction<void>,
  runnerState: RunnerState
) {
  bigtestGlobals.runnerState = runnerState;
  return cy.document({ log: false }).then((doc: Document) => {
    bigtestGlobals.document = doc;
    return interaction;
  }).then(() => {
    Cypress.log({
      displayName: runnerState,
      message: interaction.description
    });
  })
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
  
  Cypress.Commands.add('expect', (
    interaction: ReadonlyInteraction<void> | ReadonlyInteraction<void>[]
  ) => {
    if(Array.isArray(interaction)){
      interaction.map(interaction => interact(interaction, 'assertion'));
    } else {
      interact(interaction, 'assertion');
    }
  });
}
