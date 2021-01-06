import { BundlerAssertionError } from '../src/assertions/bundler-assertions';
import  expect from 'expect';

describe('BundlerAssertionError', () => {
  it('should instantiate error', () => {
    try {
      throw new BundlerAssertionError('blah');
    } catch(err){
      expect(err).toBeInstanceOf(BundlerAssertionError);
      expect(err.message).toContain('blah');
    }
  });
});

