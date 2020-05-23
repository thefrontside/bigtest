export type LocatorFn = (element: HTMLElement) => string;

export type LocatorSpecification = Record<string, LocatorFn>;

export type LocatorArguments<L extends LocatorSpecification> = [string] | [keyof L, string];

export class Locator<L extends LocatorSpecification = LocatorSpecification> {
  public name?: keyof L;
  public value: string;

  constructor(public defaultLocator: LocatorFn, public specification: L, locator: LocatorArguments<L>) {
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

  matches(element: HTMLElement): boolean {
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
