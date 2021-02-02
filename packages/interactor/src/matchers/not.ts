import { Matcher, MaybeMatcher, formatMatcher, applyMatcher } from '../matcher';

export function not<T>(matcher: MaybeMatcher<T>): Matcher<T> {
  return {
    match(actual: T): boolean {
      return !applyMatcher(matcher, actual);
    },
    format(): string {
      return `not ${formatMatcher(matcher)}`;
    },
  }
}
