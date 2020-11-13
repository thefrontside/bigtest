/* eslint-disable @typescript-eslint/no-explicit-any */
import { bigtestGlobals } from '@bigtest/globals';

declare const Cypress: any;
declare const cy: any;

function interact(interaction: any) {
  return cy.document({ log: false }).then((doc: Document) => {
    bigtestGlobals.document = doc;
    return interaction;
  })
}

Cypress.Commands.add('do', (interaction: { description: any }) => {
  bigtestGlobals.runnerState = 'step';
  // tagging the log into a then will nest it underneath the interact thus resulting in "- step" as opposed to "step" but we can't turn the command into a promise to await the interact function.
  interact(interaction).then(()=> {
    Cypress.log({
      displayName: 'step',
      message: interaction.description
    })
  });  
});

Cypress.Commands.add('expect', (interaction: { description: any }) => {
  bigtestGlobals.runnerState = 'assertion';
  interact(interaction).then(()=> {
    Cypress.log({
      displayName: 'assertion',
      message: interaction.description
    })
  });  
});
