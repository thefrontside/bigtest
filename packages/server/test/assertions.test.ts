import * as expect from 'expect';
import { assert } from '../src/assertions/assert';

describe('assert', () => {
  it('should throw AssertionError if condition is not met', () => {
    expect(() => assert(false, 'houston we have a problem')).toThrow('houston we have a problem');
  });

  it('should not throw if condition is good', () => {
    expect(assert(true, "no error here")).toBeUndefined();
  });
});
