import { AssertionError } from '../errors/assertion-error';

// I find this super useful when we have strictNullChecks true
// this could be use everywhere.
// where would common functionality go?
export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError(msg || 'assertion error');
  }
}
