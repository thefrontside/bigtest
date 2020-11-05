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

// Context Async
let t1 = test('a test')
  // should not be able to return non-object
  // $ExpectError
  t.step('return nonsense', async () => {
    return "foo";
  })

test('a test')
  .step({ description: "a description", action: async () => {} })
  .step('add to context', async () => ({ hello: "world" }))
  // $ExpectError
  .step('consume from context', async({ helloX: string }) => { goodbye: helloX })
  .step({ description: "consume from context", action: async () => {} })

// Context Sync
let t2 = test('a test')
  // should not be able to return non-object
  // $ExpectError
  t.step('return nonsense', () => {
    return "foo";
  })

test('a test')
  .step({ description: "a description", action: () => {} })
  .step('add to context', () => ({ hello: "world" }))
  // $ExpectError
  .step('consume from context', ({ helloX: string }) => { goodbye: helloX })
  .step({ description: "consume from context", action: () => {} })

//Add multiple steps
test('a test')
  .step("add context", () => ({ hello: 'world' }))
  .step(
    { description: "hello", action: async ({ hello }) => { hello.charAt(0) } },
    { description: "hello", action: ({ hello }) => { hello.charAt(0) } })
  .step('consume context after multi-step', ({ hello }) => { hello.charAt(0) })

// Add multiple steps as objects
test('say hello')
  .step({
    description: "what",
    action: () => ({ say: 'hello' })   // step 0
  }, {    
    description: "to whom",
    action: () => ({ to: "world" })    // step 1
  }, {
    description: "do nothing in between just for a laugh",
    action: () => undefined            // step 2
  },{
    description: "say it",
    action: ({ say, to }) => {         // step 3
      return { speech: `${say} ${to}`};
    }
  }, {
    description: "feeling",            // step 4
    action: () => ( { emphasis: 'bold' } )
  }, {
    description: "all together now",   // step 5 is he current limit.  You want more steps then you need more overloads
    action: ({ say, to, speech, emphasis, ending }) => {
      console.log(`${say} ${to} ${speech} ${emphasis} ${ending}`);
  }})
  .assertion({
    description: "validate text",
    check: ({ speech }) => assert.equal('hello world', speech)
  });

//Add multiple assertions
test('a test')
  .step("add context", () => ({ hello: 'world' }))
  .assertion(
    { description: "hello", check: async ({ hello }) => { hello.charAt(0) } },
    { description: "hello", check: ({ hello }) => { hello.charAt(0) } })
  .assertion('consume context after multi-step', ({ hello }) => { hello.charAt(0) });
