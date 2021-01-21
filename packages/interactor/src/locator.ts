import { LocatorFn } from './specification';
import { isMatcher, MaybeMatcher } from './matcher';

export class Locator<E extends Element> {
  constructor(public locatorFn: LocatorFn<E>, public value: MaybeMatcher<string>) {}

  get description(): string {
    if(isMatcher(this.value)) {
      return this.value.format();
    } else {
      return JSON.stringify(this.value);
    }
  }
}
