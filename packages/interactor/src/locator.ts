import { LocatorFn } from './specification';

export class Locator<E extends Element> {
  constructor(public locatorFn: LocatorFn<E>, public value: string) {}

  get description(): string {
    return `${JSON.stringify(this.value)}`;
  }
}
