import { assertBundlerState, assertCanTransition } from '../src/assertions/bundler-assertions';
import expect from 'expect';

describe('bundler state assertions', () => {
  describe('assertBundlerState', () => {
    it('should fail against a single value', () => {
      expect(() => assertBundlerState('BUILDING', { is: 'GREEN' })).toThrow(/BUILDING/);
    });
    
    it('should fail against multiple values', () => {
      expect(() => assertBundlerState('BUILDING', {is: ['GREEN', 'ERRORED']})).toThrow(/BUILDING/);
    });

    it('should pass against a single value', () => {
      expect(assertBundlerState('BUILDING', { is: 'BUILDING' })).toBeUndefined();
    });
    
    it('should pass against multiple values', () => {
      expect(assertBundlerState('BUILDING', { is: ['GREEN', 'BUILDING'] })).toBeUndefined();
    });
  });
  
  describe('assertCanTransition', () => {
    it('should fail against unmatched state', () => {
      expect(() => assertCanTransition('BUILDING', { to: 'GREEN' })).toThrow(/BUILDING(.*)GREEN/);
    });

    it('should pass against unmatched state', () => {
      expect(assertCanTransition('GREEN', { to: 'GREEN' })).toBeUndefined();
    });
  })
});

