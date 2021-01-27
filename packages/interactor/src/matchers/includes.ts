import { Matcher } from '../matcher';

export function includes(subString: string): Matcher<string> {
  return {
    match(actual: string): boolean {
      return actual.includes(subString);
    },
    format(): string {
      return `includes ${JSON.stringify(subString)}`;
    },
  }
}
