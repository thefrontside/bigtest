import { LocatorFn } from './specification';
import { matcherDescription, MaybeMatcher } from './matcher';

export class Locator<E extends Element> {
  public locatorFn: LocatorFn<E>[];
  constructor(locatorFn: LocatorFn<E> | LocatorFn<E>[], public value: MaybeMatcher<string>) {
    this.locatorFn = Array.isArray(locatorFn) ? locatorFn : [locatorFn]
  }

  get description(): string {
    return matcherDescription(this.value);
  }
}
