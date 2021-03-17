const PKG_JSON = require(`../../app/app-pkg.json`);

const { baseTemplate: base } = require('./base');
const { bigTestTemplate: bigTest } = require('./bigtest');
const { cypressTemplate: cypress } = require('./cypress');
const { jestTemplate: jest } = require('./jest');

module.exports = {
  baseTemplate: base(PKG_JSON),
  bigTestTemplate: bigTest(PKG_JSON),
  cypressTemplate: cypress(PKG_JSON),
  jestTemplate: jest(PKG_JSON)
};
