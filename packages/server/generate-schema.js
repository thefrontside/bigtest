/* eslint-disable @typescript-eslint/no-var-requires */
const { main } = require('effection');
const { exec } = require('@effection/process');

main(function*() {
  yield exec(`yarn ts-node ./src/schema.ts`, {
    env: {
      PATH: process.env.PATH,
      BIGTEST_GENERATE_SCHEMA: 'true'
    }
  }).expect();
});
