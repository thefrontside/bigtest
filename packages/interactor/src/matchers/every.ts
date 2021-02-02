import { Matcher, MaybeMatcher, applyMatcher, formatMatcher } from '../matcher';

export function every<T>(expected: MaybeMatcher<T>): Matcher<Iterable<T>> {
  return {
    match(actual: Iterable<T>): boolean {
      return Array.from(actual).every((value) => applyMatcher(expected, value));
    },
    format(): string {
      return `every item ${formatMatcher(expected)}`;
    },
  }
}
