const expect = require('expect');

const ponyfill = require('../node-ponyfill');

describe('performance ponyfill', () => {
  it('contains the perf functions', () => {
    expect(ponyfill.performance).toBeDefined();
    expect(ponyfill.performance.measure).toBeInstanceOf(Function);
  });
});
