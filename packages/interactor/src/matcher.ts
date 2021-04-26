import isEqual from 'lodash.isequal';

export type Matcher<T> = NewMatcher<T> | OldMatcher<T>;

export interface NewMatcher<T> {
  match(actual: T): boolean;
  description(): string;
  format?(): never;
}

export interface OldMatcher<T> {
  match(actual: T): boolean;
  format(): string;
  description?(): never;
}

export type MaybeMatcher<T> = Matcher<T> | T;

export function isMatcher<T>(value: MaybeMatcher<T>): value is NewMatcher<T> {
  return value && typeof (value as NewMatcher<T>).match === 'function' && typeof (value as NewMatcher<T>).description === 'function';
}

export function isDeprecatedMatcher<T>(value: MaybeMatcher<T>): value is OldMatcher<T> {
  return value && typeof (value as OldMatcher<T>).match === 'function' && typeof (value as OldMatcher<T>).format === 'function';
}

export function matcherDescription<T>(value: MaybeMatcher<T>): string {
  if(isMatcher(value)) {
    return value.description();
  } else if (isDeprecatedMatcher(value)) {
    console.warn('DEPRECATION: format() is deprecated, use description() instead')
    return value.format();
  } else {
    return JSON.stringify(value);
  }
}

export function applyMatcher<T>(value: MaybeMatcher<T>, actual: T): boolean {
  if(isMatcher(value) || isDeprecatedMatcher(value)) {
    return value.match(actual);
  } else {
    return isEqual(value, actual);
  }
}
