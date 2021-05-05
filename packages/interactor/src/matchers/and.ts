import { Matcher, MaybeMatcher, matcherDescription, applyMatcher } from '../matcher';

export function and<T>(...args: MaybeMatcher<T>[]): Matcher<T> {
  return {
    match(actual: T): boolean {
      return args.every((matcher) => applyMatcher(matcher, actual));
    },
    description(): string {
      return args.map(matcherDescription).join(' and ');
    },
  }
}
