import { AssertionError } from '../errors/assertion-error';

// I find this super useful when we have strictNullChecks true
// typescript asserts 
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions
// this could be used in a number of places
// if so, where would common functionality go?
export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError(msg || 'assertion error');
  }
}
