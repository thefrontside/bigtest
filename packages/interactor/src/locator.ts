import { LocatorFn, LocatorSpecification } from './specification';

export interface LocatorOptions<E extends Element> {
  name?: string;
  locators?: LocatorSpecification<E>;
}

export class Locator<E extends Element> {
  private locatorFns: Array<LocatorFn<E>>;
  public name?: string;

  constructor(locator: string | string[] | LocatorFn<E>, public value: string, { locators = {}, name }: LocatorOptions<E> = { locators: {} }) {
    if (typeof locator === 'string') {
      let locatorFn = locators[locator];
      if (!locatorFn) {
        throw new Error(`Unable to find locator "${locator}"`);
      }
      this.locatorFns = [locatorFn];
    } else if (typeof locator === 'object') {
      this.locatorFns = locator.map(name => locators[name]);
    } else {
      this.locatorFns = [locator];
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
    for (let fn of this.locatorFns) {
      if (fn(element) === this.value) {
        return true;
      }
    }

    return false;
  }
}
