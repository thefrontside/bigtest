const { spawn } = require('effection');
const { main, exec } = require('@effection/node');

main(function*() {
  // get the path to the `ts-node` binstub.
  // `@effection/node#exec() uses the shellwords package to split
  // command and arguments, but that has a bug that causes it to
  // to treat `\` as a literal indicator and not a path separator
  // which causes it to fail on windows, so we have to do a bit of
  // munging to a unix path separator, which is then (thankfully)
  // re-munged by cross-spawn.
  // See https://github.com/jimmycuadra/shellwords/issues/10
  let tsNode = (yield getsh('yarn bin ts-node'))
      .trim().replace(/\\/g, '/');

  yield sh(`${tsNode} ./src/schema.ts`, {
    env: {
      PATH: process.env.PATH,
      BIGTEST_GENERATE_SCHEMA: 'true'
    }
  });
});

function* sh(command, options) {
  console.log(`$ ${command}`);
  let child = yield exec(command, options);

  yield spawn(child.stdout.subscribe().forEach(function*(datum) {
    process.stdout.write(datum);
  }));

  yield spawn(child.stderr.subscribe().forEach(function*(datum) {
    process.stderr.write(datum);
  }));

  yield child.expect();
}


function* getsh(command) {
  let stdout = '';

  let child = yield exec(command);

  yield spawn(child.stdout.subscribe().forEach(function*(datum) {
    stdout += datum;
  }));

  yield child.expect();

  return stdout;
}
