import { AssertionError } from './assertion-error';

export function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError(msg || 'assertion error');
  }
}
