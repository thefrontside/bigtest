import { Matcher, MaybeMatcher, applyMatcher, formatMatcher } from '../matcher';

export function some<T>(expected: MaybeMatcher<T>): Matcher<Iterable<T>> {
  return {
    match(actual: Iterable<T>): boolean {
      return Array.from(actual).some((value) => applyMatcher(expected, value));
    },
    format(): string {
      return `some item ${formatMatcher(expected)}`;
    },
  }
}
