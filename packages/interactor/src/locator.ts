import { LocatorFn, NullLocatorFn } from './specification';
import { noCase } from 'change-case';

export class Locator<E extends Element> {
  public locatorFn: LocatorFn<E> | NullLocatorFn;
  public value: string | null;
  public name: string | null;
  public isNull: boolean;

  constructor();
  constructor(locatorFn: LocatorFn<E>, value: string, name?: string);
  constructor(locatorFn?: LocatorFn<E>, value?: string | null, name?: string) {
    this.locatorFn = locatorFn || (() => null);
    this.value = value || null;
    this.name = name || null;
    this.isNull = this.value == null;
  }

  get description(): string {
    if(this.name) {
      return `${noCase(this.name)} ${JSON.stringify(this.value)}`;
    } else {
      return `${JSON.stringify(this.value)}`;
    }
  }
}
