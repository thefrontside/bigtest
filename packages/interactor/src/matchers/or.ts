import { Matcher, MaybeMatcher, formatMatcher, applyMatcher } from '../matcher';

export function or<T>(...args: MaybeMatcher<T>[]): Matcher<T> {
  return {
    match(actual: T): boolean {
      return args.some((matcher) => applyMatcher(matcher, actual));
    },
    format(): string {
      return args.map(formatMatcher).join(' or ');
    },
  }
}
