import { describe, it } from 'mocha';
import * as expect from 'expect'

import { test } from '../src/index';

let example = test('a test')
  .step('some step', async () => {
    return { foo: 'foo' }
  })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  .step('this does nothing', async() => {})
  .step('another step', async ({ foo }) => {
    return { bar: foo.toUpperCase() + 'bar' }
  })
  .assertion('this is an assertion', async ({ foo }) => {
    expect(foo).toEqual('foo');
  })
  .assertion('this is another assertion', async ({ bar }) => {
    expect(bar).toEqual('foobar');
  })
  .child('a child test', test => test
    .step('a child step', async ({ foo }) => {
      return { quox: foo.toUpperCase() + 'blah' }
    })
    .assertion('a child assertion', async ({ quox }) => {
      expect(quox).toEqual('FOOblah');
    })
  );

let stepWithDescription = Object.assign(Promise.resolve({ bar: 123 }), {
  description: 'this is a description'
});

let assertionWithDescription = Object.assign(Promise.resolve(undefined), {
  description: 'shorthand assertion with description'
});

let shorthandExample = test('a test')
  .step('some step', Promise.resolve({ foo: 'foo' }))
  .step(stepWithDescription)
  .assertion('this is an assertion', async ({ foo, bar }) => {
    expect(foo).toEqual('foo');
    expect(bar).toEqual(123);
  })
  .assertion('shorthand assertion', Promise.resolve(undefined))
  .assertion(assertionWithDescription);

describe('dsl', () => {
  it('returns a serialized test suite', async () => {
    expect(example.description).toEqual('a test');
    expect(example.steps[0].description).toEqual('some step');
    expect(example.steps[1].description).toEqual('this does nothing');
    expect(example.steps[2].description).toEqual('another step');
    expect(example.assertions[0].description).toEqual('this is an assertion');
    expect(example.assertions[1].description).toEqual('this is another assertion');
    expect(example.children[0].description).toEqual('a child test');
    expect(example.children[0].steps[0].description).toEqual('a child step');
    expect(example.children[0].assertions[0].description).toEqual('a child assertion');

    await expect(example.steps[0].action({})).resolves.toHaveProperty('foo', 'foo');
  });

  it('can use shorthand forms', async () => {
    expect(shorthandExample.description).toEqual('a test');
    expect(shorthandExample.steps[0].description).toEqual('some step');
    expect(shorthandExample.steps[1].description).toEqual('this is a description');
    expect(shorthandExample.assertions[0].description).toEqual('this is an assertion');
    expect(shorthandExample.assertions[1].description).toEqual('shorthand assertion');
    expect(shorthandExample.assertions[2].description).toEqual('shorthand assertion with description');

    await expect(shorthandExample.steps[0].action({})).resolves.toHaveProperty('foo', 'foo');
    await expect(shorthandExample.steps[1].action({})).resolves.toHaveProperty('bar', 123);
    await expect(shorthandExample.assertions[1].check({})).resolves.toEqual(undefined);
    await expect(shorthandExample.assertions[2].check({})).resolves.toEqual(undefined);
  });
})
