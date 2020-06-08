import { LocatorFn } from './specification';

export class Locator<E extends Element> {
  constructor(public locatorFn: LocatorFn<E>, public value: string, public name?: string) {}

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
