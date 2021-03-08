const fsp = require('fs').promises;
const rmrfsync = require('rimraf').sync;

function* bigtestOnly(dir) {
  let { dependencies } = require(`${dir}/package.json`);
  let { bigtest, parcel, react, 'react-dom': reactDom, typescript } = dependencies;

  let pkgjson = JSON.stringify({
    "name": "bigtest-sample-app",
    "version": "0.0.0",
    "private": true,
    "description": "BigTest Sample App - BO",
    "repository": "https://github.com/thefrontside/bigtest.git",
    "author": "Frontside Engineering <engineering@frontside.com>",
    "license": "MIT",
    "scripts": {
      "start": "parcel src/index.html",
      "build": "parcel build src/index.html --no-cache",
      "test:bigtest": "bigtest ci"
    },
    "dependencies": {
      "bigtest": `${bigtest}`,
      "parcel": `${parcel}`,
      "react": `${react}`,
      "react-dom": `${reactDom}`,
      "typescript": `${typescript}`
    },
    "volta": {
      "node": "12.16.0",
      "yarn": "1.19.1"
    }
  }, null, 2);

  let files_to_remove = ['cypress', 'cypress.json', 'src/test/cypress.spec.js', 'src/test/jest.test.js', 'readme.md'];

  files_to_remove.forEach(file => {
    rmrfsync(`${dir}/${file}`);
  });
  yield fsp.writeFile(`${dir}/package.json`, pkgjson);
}

module.exports = {
  bigtestOnly
};
