export type LocatorFn<E extends Element> = (element: E) => string;
import { FilterImplementation, InteractorSpecification } from './specification';

export class Filter<E extends Element, S extends InteractorSpecification<E>> {
  constructor(
    public specification: S,
    public filters: FilterImplementation<E, S>
  ) {};

  get description(): string {
    let entries = Object.entries(this.filters);
    if(entries.length === 0) {
      return '';
    } else {
      return entries.map(([key, value]) => {
        if(typeof(value) === 'boolean') {
          if(value) {
            return `which is ${key}`;
          } else {
            return `which is not ${key}`;
          }
        } else {
          return `with ${key} ${JSON.stringify(value)}`
        }
      }).join(' and ');
    }
  }

  matches(element: E): boolean {
    return Object.entries(this.specification.filters || {}).every(([key, definition]) => {
      let value;
      if(key in this.filters) {
        value = (this.filters as any)[key];
      } else if(typeof(definition) !== 'function' && 'default' in definition) {
        value = definition.default;
      } else {
        return true;
      }
      if(typeof(definition) === 'function') {
        return definition(element) === value;
      } else {
        return definition.apply(element) === value;
      }
    });
  }
}
