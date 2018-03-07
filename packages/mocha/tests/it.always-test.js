import { describe, before, it } from 'mocha';
import { expect } from 'chai';
import { run } from './helpers';

import { it as convergentIt } from '../src';

describe('BigTest Mocha: it.always', () => {
  let tests;

  before(() => run('it.always-fixture.js').then((results) => {
    tests = results.tests;
  }));

  it('successfully passes after the timeout', () => {
    expect(tests[0].duration).to.be.within(100, 120);
    expect(tests[0].err).to.be.empty;
  });

  it('can modify the timeout', () => {
    expect(tests[1].duration).to.be.within(50, 70);
    expect(tests[1].err).to.be.empty;
  });

  it('throws when the assertion fails', () => {
    expect(tests[2].duration).to.be.within(200, 220);
    expect(tests[2].err).to.have.property('expected', '0');
  });

  it('always sets the test timeout to 0', () => {
    let test = convergentIt.always('test', () => {});

    return test.timeout(50).fn().then(() => {
      expect(test.timeout()).to.equal(0);
    });
  });
});

describe('BigTest Mocha: it.always.only', () => {
  let tests;

  before(() => run('it.always.only-fixture.js').then((results) => {
    tests = results.tests;
  }));

  it('has multiple aliases', () => {
    expect(convergentIt.always.only).to.equal(convergentIt.only.always);
  });

  it('runs a single test', () => {
    expect(tests).to.have.lengthOf(1);
    expect(tests[0].duration).to.be.within(100, 120);
    expect(tests[0].err).to.be.empty;
  });
});
