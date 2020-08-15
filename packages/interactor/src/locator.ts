import { LocatorFn, LocatorSpecification } from './specification';

export interface LocatorOptions<E extends Element, L extends LocatorSpecification<E>> {
  name?: string;
  locators?: L['locators'];
}

export class Locator<E extends Element, L extends LocatorSpecification<E>> {
  private locatorFns: Array<LocatorFn<E>>;
  public name?: string;

  constructor(
    locator: keyof L['locators'] | Array<keyof L['locators']> | LocatorFn<E>,
    public value: string,
    { locators = Object.create({}), name }: LocatorOptions<E, L> = { locators: Object.create({}) }
  ) {
    if (typeof locator === 'string') {
      let locatorFn = locators[locator];
      if (!locatorFn) {
        throw new Error(`Unable to find locator "${locator}"`);
      }
      this.locatorFns = [locatorFn];
    } else if (typeof locator === 'object') {
      this.locatorFns = locator.map(name => locators[name]);
    } else if (typeof locator === 'function') {
      this.locatorFns = [locator];
    } else {
      throw new Error('asdf')
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
