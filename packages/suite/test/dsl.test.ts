import { describe, it } from 'mocha';
import expect from 'expect'

import { test }from '../src';
import example from './fixtures/example';

const noop = () => undefined;

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

  it('can have multiple steps', () => {
    let { steps } = test('a test')
      .step(
        { description: "hello", action: noop },
        { description: "world", action: noop });

    expect(steps.map(step => step.description)).toEqual(['hello', 'world']);
  });
  it('can have multiple assertions', () => {
    let { assertions } = test('an assertion').
      assertion(
        { description: "hello", check: noop },
        { description: "world", check: noop });

    expect(assertions.map(assertion => assertion.description)).toEqual(['hello', 'world']);
  });

  it('prevents adding steps after adding assertions', () => {
    let base = test('an assertion').assertion("hello", noop)
    expect(() => base.step('foo', noop)).toThrowError()
  });

  it('prevents adding steps after adding child', () => {
    let base = test('an assertion').child('foo', (test) => test)
    expect(() => base.step('foo', noop)).toThrowError()
  });

  it('prevents adding assertions after adding child', () => {
    let base = test('an assertion').child('foo', (test) => test)
    expect(() => base.assertion('foo', noop)).toThrowError()
  });
})
