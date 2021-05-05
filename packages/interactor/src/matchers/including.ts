import { Matcher } from '../matcher';

export function including(subString: string): Matcher<string> {
  return {
    match(actual: string): boolean {
      return actual.includes(subString);
    },
    description(): string {
      return `including ${JSON.stringify(subString)}`;
    },
  }
}
