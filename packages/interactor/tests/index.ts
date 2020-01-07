const chaiOG = require('chai');
const chaiAsPromised = require('chai-as-promised');

chaiOG.use(chaiAsPromised);

const requireTest = require.context('.', true, /-test.ts/);
requireTest.keys().forEach(requireTest);
