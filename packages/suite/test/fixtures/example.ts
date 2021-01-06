import { test } from '../../src/index';
import { strict as assert } from 'assert';

export default test('a test')
  .step('some step', async () => {
    return { foo: 'foo' };
  })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  .step('this does nothing', async() => {})
  .step('another step', async ({ foo }) => {
    return { bar: foo.toUpperCase() + 'bar' };
  })
  .assertion('this is an assertion', async ({ foo }) => {
    assert.equal(foo, 'foo');
  })
  .assertion('this is another assertion', async ({ bar }) => {
    assert.equal(bar, 'foobar');
  })
  .child('a child test', test => test
    .step('a child step', async ({ foo }) => {
      return { quox: foo.toUpperCase() + 'blah' };
    })
    .assertion('a child assertion', async ({ quox }) => {
      assert.equal(quox, 'FOOblah');
    })
  );
