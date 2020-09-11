import { describe, it } from 'mocha';
import * as expect from 'expect'

import example from './fixtures/example';
import givenWhenThen from './fixtures/given-when-then';

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

  it('can use given when then format', async () => {
    expect(givenWhenThen.description).toEqual('a test');
    expect(givenWhenThen.steps[0].description).toEqual('given some step');
    expect(givenWhenThen.steps[1].description).toEqual('when this does nothing');
    expect(givenWhenThen.steps[2].description).toEqual('when another step');
    expect(givenWhenThen.assertions[0].description).toEqual('then this is an assertion');
    expect(givenWhenThen.assertions[1].description).toEqual('then this is another assertion');
    expect(givenWhenThen.children[0].description).toEqual('a child test');
    expect(givenWhenThen.children[0].steps[0].description).toEqual('when a child step');
    expect(givenWhenThen.children[0].assertions[0].description).toEqual('then a child assertion');

    await expect(givenWhenThen.steps[0].action({})).resolves.toHaveProperty('foo', 'foo');
  });
})
