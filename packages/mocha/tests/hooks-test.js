import { describe, before, it } from 'mocha';
import { expect } from 'chai';
import { run } from './helpers';

describe('BigTest Mocha: hooks', () => {
  let stats;

  before(() => run('hooks-fixture.js').then((results) => {
    stats = results.stats;
  }));

  it('runs returned convergences automatically', () => {
    expect(stats.passes).to.equal(stats.tests);
    expect(stats.failures).to.equal(0);
  });
});

describe('BigTest Mocha: hooks timing', () => {
  let stats;

  before(() => run('hooks-timing-fixture.js').then((results) => {
    stats = results.stats;
  }));

  it('runs the convergence within the timeout', () => {
    expect(stats.passes).to.equal(1);
    expect(stats.failures).to.equal(0);
  });
});
