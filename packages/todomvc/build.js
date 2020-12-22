// $ rm -rf dist && yarn mkdirp dist -p
// $ cd app
// $ cp app.package.json package.json
// $ react-scripts build
// $ cd ..
// & mv app/build dist/app
// $ tsc --build

const { spawn } = require('effection');
const { main, exec } = require('@effection/node');
const { rmdir, mkdir, copyFile, rename } = require('fs').promises;

main(function*() {
  yield rmdir('./dist', { recursive: true });
  yield mkdir('./dist', { recursive: true });

  yield copyFile('./app/app.package.json', './app/package.json');

  yield sh('react-scripts build', {
    cwd: './app'
  });

  yield rename('app/build', 'dist/app');

  yield sh('tsc --build');
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
