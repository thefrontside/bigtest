import { assert } from '../src';
import * as expect from 'expect';

describe('assert', () => {
  it('should throw AssertionError if condition is falsey', () => {
    expect(() => assert(false, 'houston we have a problem')).toThrow('houston we have a problem');
  });

  it('should not throw if condition is good', () => {
    expect(assert(true)).toBeUndefined();
  });
});
