import { describe, before, it } from 'mocha';
import { expect } from 'chai';
import { run } from './helpers';

describe('BigTest Mocha: it', () => {
  let tests;

  before(() => run('it-fixture.js').then((results) => {
    tests = results.tests;
  }));

  it('successfully passes for async tests', () => {
    expect(tests[0].duration).to.be.within(50, 70);
    expect(tests[0].err).to.be.empty;
  });

  it('throws on failure before the timeout', () => {
    expect(tests[1].duration).to.be.within(180, 200);
    expect(tests[1].err).to.have.property('expected', 200);
  });
});

describe('BigTest Mocha: it.only', () => {
  let tests;

  before(() => run('it.only-fixture.js').then((results) => {
    tests = results.tests;
  }));

  it('runs a single test', () => {
    expect(tests).to.have.lengthOf(1);
    expect(tests[0].duration).to.be.within(50, 70);
    expect(tests[0].err).to.be.empty;
  });
});
