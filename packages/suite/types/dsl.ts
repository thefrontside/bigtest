import { test } from '../src/index';
import { strict as assert } from 'assert';

test('a test')
  .step('some step', async () => {
    return { foo: 'foo' }
  })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  .step('this does nothing', async() => {})
  .step('another step', async ({ foo }) => {
    return { bar: foo.toUpperCase() + 'bar' }
  })
  .assertion('this is an assertion', ({ foo }) => {
    assert.equal(foo, 'foo');
  })
  .assertion('this is another assertion', ({ bar }) => {
    assert.equal(bar, 'foobar');
  })
  .child('a child test', test => test
    .step('a child step', async ({ foo }) => {
      return { quox: foo.toUpperCase() + 'blah' }
    })
    .assertion('a child assertion', ({ quox }) => {
      assert.equal(quox, 'FOOblah');
    })
  );

test('a test')
  .step('some step', async () => {
    return { foo: 'foo' }
  })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  .step('this does nothing', async() => {})
  .step('another step', async ({ foo }) => {
    // should preserve type when passed through context
    // $ExpectError
    Math.abs(foo);
  })

test('a test')
  // should not be able to return non-object
  // $ExpectError
  .step('return nonsense', async () => {
    return "foo";
  })
