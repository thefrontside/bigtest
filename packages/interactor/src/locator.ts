import { LocatorFn } from './specification';
import { matcherDescription, MaybeMatcher } from './matcher';

export class Locator<E extends Element> {
  constructor(public locatorFn: LocatorFn<E>, public value: MaybeMatcher<string>) {}

  get description(): string {
    return matcherDescription(this.value);
  }
}
