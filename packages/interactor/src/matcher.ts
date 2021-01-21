export interface Matcher<T> {
  bigtestMatcher: true;
  match(actual: T): boolean;
  format(): string;
}

export type MaybeMatcher<T> = Matcher<T> | T;

export function isMatcher<T>(value: MaybeMatcher<T>): value is Matcher<T> {
  return value && (value as any).bigtestMatcher === true;
}
