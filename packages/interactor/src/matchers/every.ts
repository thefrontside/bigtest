import { Matcher, MaybeMatcher, applyMatcher, matcherDescription } from '../matcher';

export function every<T>(expected: MaybeMatcher<T>): Matcher<Iterable<T>> {
  return {
    match(actual: Iterable<T>): boolean {
      return Array.from(actual).every((value) => applyMatcher(expected, value));
    },
    description(): string {
      return `every item ${matcherDescription(expected)}`;
    },
  }
}
