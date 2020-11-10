const { spawn } = require('effection');
const { main, exec } = require('@effection/node');

main(function*() {
  let tsNode = yield getsh('yarn bin ts-node');

  yield sh(`${tsNode.trim()} ./src/schema.ts`, {
    env: {
      PATH: process.env.PATH,
      BIGTEST_GENERATE_SCHEMA: 'true'
    }
  });
})

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
