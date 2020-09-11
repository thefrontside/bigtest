import { test } from '../../src/index';
import { strict as assert } from 'assert';

export default test('a test')
  .given('some step', async () => {
    return { foo: 'foo' }
  })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  .when('this does nothing', async() => {})
  .when('another step', async ({ foo }) => {
    return { bar: foo.toUpperCase() + 'bar' }
  })
  .then('this is an assertion', async ({ foo }) => {
    assert.equal(foo, 'foo');
  })
  .then('this is another assertion', async ({ bar }) => {
    assert.equal(bar, 'foobar');
  })
  .test('a child test', child => child
    .when('a child step', async ({ foo }) => {
      return { quox: foo.toUpperCase() + 'blah' }
    })
    .then('a child assertion', async ({ quox }) => {
      assert.equal(quox, 'FOOblah');
    })
  );
