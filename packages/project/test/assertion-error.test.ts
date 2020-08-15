import { AssertionError } from '../src';
import * as expect from 'expect';

describe('AssertionError', () => {
  it('should instantiate error', () => {
    try {
      throw new AssertionError('blah');
    } catch(err){
      expect(err).toBeInstanceOf(AssertionError);
      expect(err.message).toBe('blah');
    }
  });
});