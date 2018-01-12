import { module, beforeEach, afterEach, test } from '../../src';

module('it', function () {
  let value = 0;
  let interval;

  beforeEach(() => {
    interval = setInterval(() => value += 1, 10);
  });

  afterEach(() => {
    clearInterval(interval);
  });

  test('eventually passes', () => {
    assert.equal(value, 5);
  });

  test('throws just before the timeout', () => {
    assert.equal(value, 200);
  }).timeout(200);
});
