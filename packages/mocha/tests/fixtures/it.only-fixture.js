import { describe, before, after, it } from '../../src';
import { expect } from 'chai';

describe('it.only', function () {
  let value = 0;
  let interval;

  before(() => {
    interval = setInterval(() => value += 1, 10);
  });

  after(() => {
    clearInterval(interval);
  });

  it.only('runs this test', () => {
    expect(value).to.equal(5);
  });

  it('does not run this test', () => {
    expect(0).to.equal(1, 'this test should have been skipped');
  });
});
