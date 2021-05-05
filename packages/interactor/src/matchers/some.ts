import { Matcher, MaybeMatcher, applyMatcher, matcherDescription } from '../matcher';

export function some<T>(expected: MaybeMatcher<T>): Matcher<Iterable<T>> {
  return {
    match(actual: Iterable<T>): boolean {
      return Array.from(actual).some((value) => applyMatcher(expected, value));
    },
    description(): string {
      return `some item ${matcherDescription(expected)}`;
    },
  }
}
