const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const requireTest = require.context('.', true, /-test/);
requireTest.keys().forEach(requireTest);
