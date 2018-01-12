import { module, beforeEach, test, assert } from 'qunit';
import { run } from './helpers';

module('BigTest QUnit: test', () => {
  let tests;

  beforeEach(() => run('it-fixture.js').then((results) => {
    tests = results.tests;
  }));

  test('successfully passes for async tests', () => {
    // expect(tests[0].duration).to.be.within(50, 70);
    assert.ok(tests[0].duration > 50 && tests[0].duration < 70);

    // expect(tests[0].err).to.be.empty;
    assert.equal(tests[0].err, '');
  });

  test('throws on failure before the timeout', () => {
    //expect(tests[1].duration).to.be.within(180, 200);
    assert.ok(tests[1].duration > 180 && tests[1].duration < 200);

    //expect(tests[1].err).to.have.property('expected', '200');
    assert.equal(tests[1].err.expected, '200')
  });
});
