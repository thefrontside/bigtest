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
  .assertion('this is an assertion', async ({ foo }) => {
    assert.equal(foo, 'foo');
  })
  .assertion('this is another assertion', async ({ bar }) => {
    assert.equal(bar, 'foobar');
  })
  .child('a child test', test => test
    .step('a child step', async ({ foo }) => {
      return { quox: foo.toUpperCase() + 'blah' }
    })
    .assertion('a child assertion', async ({ quox }) => {
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

test('a test')
  .step({ description: "a description", action: async () => {} })
  .step('add to context', async () => ({ hello: "world" }))
  // $ExpectError
  .step('consume from context', async({ helloX: string }) => { goodbye: helloX })
  .step({ description: "consume from context", action: async () => {} })
