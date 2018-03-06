import { describe, beforeEach, afterEach, it } from '../../src';
import { expect } from 'chai';

describe('it.always.only', () => {
  let value = 0;
  let timeout;

  beforeEach(() => {
    timeout = setTimeout(() => value = 1, 200);
  });

  afterEach(() => {
    clearTimeout(timeout);
  });

  it.always.only('runs this test', () => {
    expect(value).to.equal(0);
  });

  it('does not run this test', () => {
    expect(0).to.equal(1, 'this test should have been skipped');
  });
});
