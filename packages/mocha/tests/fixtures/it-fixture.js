import { describe, before, after, it } from '../../src';
import { expect } from 'chai';

describe('it', function() {
  let value = 0;
  let interval;

  before(() => {
    interval = setInterval(() => value += 1, 10);
  });

  after(() => {
    clearInterval(interval);
  });

  it('eventually passes', () => {
    expect(value).to.equal(5);
  });

  it('throws just before the timeout', () => {
    expect(value).to.equal(200);
  }).timeout(200);
});
