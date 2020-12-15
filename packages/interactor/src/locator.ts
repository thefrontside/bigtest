import { LocatorFn } from './specification';


/** @internal */
export class Locator<E extends Element> {
  constructor(public locatorFn: LocatorFn<E>, public value: string) {}

  get description(): string {
    return `${JSON.stringify(this.value)}`;
  }
}
