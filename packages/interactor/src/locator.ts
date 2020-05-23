export type LocatorFn<E extends HTMLElement> = (element: E) => string;

export type LocatorSpecification<E extends HTMLElement> = Record<string, LocatorFn<E>>;

export type LocatorArguments<E extends HTMLElement, L extends LocatorSpecification<E>> = [string] | [keyof L, string];

export class Locator<E extends HTMLElement, L extends LocatorSpecification<E> = LocatorSpecification<E>> {
  public name?: keyof L;
  public value: string;

  constructor(public defaultLocator: LocatorFn<E>, public specification: L, locator: LocatorArguments<E, L>) {
    if(locator.length === 2) {
      this.name = locator[0];
      this.value = locator[1];
    } else {
      this.value = locator[0];
    }
  }

  get description(): string {
    if(this.name) {
      return `with ${this.name} ${JSON.stringify(this.value)}`;
    } else {
      return `${JSON.stringify(this.value)}`;
    }
  }

  matches(element: E): boolean {
    if(this.name) {
      let locator = this.specification[this.name];

      if(!locator) {
        throw new  Error(`unknown locator '${this.name}', available locators are ${Object.keys(this.specification)}`);
      }

      return locator(element) === this.value;
    } else {
      return this.defaultLocator(element) === this.value;
    }
  }
}
