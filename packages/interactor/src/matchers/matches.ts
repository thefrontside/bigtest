import { Matcher } from '../matcher';

export function matches(regexp: RegExp): Matcher<string> {
  return {
    match(actual: string): boolean {
      return actual.match(regexp) != null;
    },
    format(): string {
      return `matches ${regexp}`;
    },
  }
}
