import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import { it as convergentIt } from '../src';

describe('BigTest Mocha: it.pause', () => {
  let test;

  beforeEach(() => {
    test = convergentIt.pause('test');
  });

  it('returns a promise', () => {
    expect(test.fn()).to.be.a('Promise');
  });

  it('always sets the test timeout to 0', () => {
    test.timeout(2000).fn();
    expect(test.timeout()).to.equal(0);
  });

  it('.only has multiple aliases', () => {
    expect(convergentIt.pause.only).to.equal(convergentIt.only.pause);
  });
});
