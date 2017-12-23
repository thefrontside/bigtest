import { describe, beforeEach, afterEach, it } from '../../src';
import { expect } from 'chai';

describe('it.always', function () {
  let value = 0;
  let timeout;

  beforeEach(() => {
    timeout = setTimeout(() => value = 1, 100);
  });

  afterEach(() => {
    clearTimeout(timeout);
  });

  it.always('eventually passes before the timeout', () => {
    expect(value).to.equal(0);
  }).timeout(100);

  it.always('throws if the assertion eventually fails', () => {
    expect(value).to.equal(0);
  });
});
