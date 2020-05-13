import { describe, it } from 'mocha';
import * as expect from 'expect'

import example from './fixtures/example';

describe('@bigtest/dsl', () => {
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
})
