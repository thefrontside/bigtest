const requireTest = require.context('.', true, /-test.ts/);
requireTest.keys().forEach(requireTest);
