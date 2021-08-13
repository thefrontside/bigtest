/* eslint-disable @typescript-eslint/no-var-requires */
const { main } = require('effection');
const { exec } = require('@effection/process');

main(function*() {
  // get the path to the `ts-node` binstub.
  // `@effection/process#exec() uses the shellwords package to split
  // command and arguments, but that has a bug that causes it to
  // to treat `\` as a literal indicator and not a path separator
  // which causes it to fail on windows, so we have to do a bit of
  // munging to a unix path separator, which is then (thankfully)
  // re-munged by cross-spawn.
  // See https://github.com/jimmycuadra/shellwords/issues/10
  let { stdout } = yield exec('yarn bin ts-node').expect();
  let tsNode = stdout.trim().replace(/\\/g, '/');

  yield exec(`${tsNode} ./src/schema.ts`, {
    env: {
      PATH: process.env.PATH,
      BIGTEST_GENERATE_SCHEMA: 'true'
    }
  }).expect();
});
