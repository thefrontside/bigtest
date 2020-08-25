import { LocatorFn } from './specification';
import { noCase } from 'change-case';

export class Locator<E extends Element> {
  constructor(public locatorFn: LocatorFn<E>, public value: string, public name?: string) {}

  get description(): string {
    if(this.name) {
      return `${noCase(this.name)} ${JSON.stringify(this.value)}`;
    } else {
      return `${JSON.stringify(this.value)}`;
    }
  }

  matches(element: E): boolean {
    return this.locatorFn(element) === this.value;
  }
}
