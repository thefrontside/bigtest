import { describe, beforeEach, afterEach, it } from '../../src';
import { expect } from 'chai';

describe('it.always', () => {
  let value, timeout;

  beforeEach(() => {
    value = 0;
    timeout = setTimeout(() => value = 1, 200);
  });

  afterEach(() => {
    clearTimeout(timeout);
  });

  it.always('eventually passes after the timeout', () => {
    expect(value).to.equal(0);
  });

  it.always('can modify the timeout', () => {
    expect(value).to.equal(0);
  }).timeout(50);

  it.always('throws if the assertion eventually fails', () => {
    expect(value).to.equal(0);
  }).timeout(300);
});
