import { AssertionError } from '../src/errors/assertion-error';
import * as expect from 'expect';

describe('AssertionError', () => {
  it('should instantiate error', () => {
    let error = new AssertionError('blah');

    expect(error).toBeInstanceOf(AssertionError);
    expect(error.message).toBe('blah');
  });
});
