import { Matcher, MaybeMatcher, matcherDescription, applyMatcher } from '../matcher';

export function or<T>(...args: MaybeMatcher<T>[]): Matcher<T> {
  return {
    match(actual: T): boolean {
      return args.some((matcher) => applyMatcher(matcher, actual));
    },
    description(): string {
      return args.map(matcherDescription).join(' or ');
    },
  }
}
