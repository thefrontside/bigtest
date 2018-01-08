import { describe, before, it } from 'mocha';
import { expect } from 'chai';

import { it as convergentIt } from '../src';

describe('BigTest Mocha: it.pause', () => {
  let test;

  before(() => {
    test = convergentIt.pause('test');
  });

  it('should set the timeout to 0', () => {
    expect(test._timeout).to.equal(0);
  });

  it('should return a promise', () => {
    expect(test.fn()).to.be.a('Promise');
  });

  it('.only has multiple aliases', () => {
    expect(convergentIt.pause.only).to.equal(convergentIt.only.pause);
  });
});
