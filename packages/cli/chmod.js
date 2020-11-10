const { main } = require('@effection/node');
const { chmod } = require('fs').promises;

main(function*() {
  let [,,mode, path] = process.argv;
  yield chmod(path, mode);
});
