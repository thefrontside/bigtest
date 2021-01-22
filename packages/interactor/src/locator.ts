import { LocatorFn } from './specification';
import { formatMatcher, MaybeMatcher } from './matcher';

export class Locator<E extends Element> {
  constructor(public locatorFn: LocatorFn<E>, public value: MaybeMatcher<string>) {}

  get description(): string {
    return formatMatcher(this.value);
  }
}
