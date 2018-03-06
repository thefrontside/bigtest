import { describe, before, it } from 'mocha';
import { expect } from 'chai';
import { run } from './helpers';

describe('BigTest Mocha: suite options', () => {
  let stats;

  before(() => run('latency-fixture.js').then((results) => {
    stats = results.stats;
  }));

  it('should have a latency option available for every context', () => {
    expect(stats.passes).to.equal(stats.tests);
    expect(stats.failures).to.equal(0);
  });
});
