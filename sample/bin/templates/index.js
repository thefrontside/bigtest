const PKG_JSON = require(`../../app/app-pkg.json`);

const { baseTemplate: base } = require('./base');
const { bigtestTemplate: bigtest } = require('./bigtest');
const { cypressTemplate: cypress } = require('./cypress');
const { jestTemplate: jest } = require('./jest');

module.exports = {
  baseTemplate: base(PKG_JSON),
  bigtestTemplate: bigtest(PKG_JSON),
  cypressTemplate: cypress(PKG_JSON),
  jestTemplate: jest(PKG_JSON)
};
