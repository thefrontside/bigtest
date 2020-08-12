import { LocatorFn, LocatorSpecification } from './specification';

export interface LocatorOptions<E extends Element> {
  name?: string;
  locators?: LocatorSpecification<E>;
}

export class Locator<E extends Element> {
  private locatorFn: LocatorFn<E>;
  public name?: string;

  constructor(locator: string | LocatorFn<E>, public value: string, { locators = {}, name }: LocatorOptions<E> = { locators: {} }) {
    if (typeof locator === 'string') {
      let locatorFn = locators[locator];
      if (!locatorFn) {
        throw new Error(`Unable to find locator "${locator}"`);
      }
      this.locatorFn = locatorFn;
    } else {
      this.locatorFn = locator;
    }
    this.name = name;
  }

  get description(): string {
    if(this.name) {
      let name = this.name.toString().replace(/^by/, '');
      name = name.charAt(0).toLowerCase() + name.slice(1);
      return `with ${name} ${JSON.stringify(this.value)}`;
    } else {
      return `${JSON.stringify(this.value)}`;
    }
  }

  matches(element: E): boolean {
    return this.locatorFn(element) === this.value;
  }
}
