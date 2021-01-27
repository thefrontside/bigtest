import { Matcher, MaybeMatcher, formatMatcher, applyMatcher } from '../matcher';

export function and<T>(...args: MaybeMatcher<T>[]): Matcher<T> {
  return {
    match(actual: T): boolean {
      return args.every((matcher) => applyMatcher(matcher, actual));
    },
    format(): string {
      return args.map(formatMatcher).join(' and ');
    },
  }
}
