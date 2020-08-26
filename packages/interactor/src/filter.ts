export type LocatorFn<E extends Element> = (element: E) => string;
import { FilterImplementation, InteractorSpecification } from './specification';
import { noCase } from 'change-case';

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
            return `which is ${noCase(key)}`;
          } else {
            return `which is not ${noCase(key)}`;
          }
        } else {
          return `with ${noCase(key)} ${JSON.stringify(value)}`
        }
      }).join(' and ');
    }
  }

  get all(): FilterImplementation<E, S> {
    let filter: Record<string, unknown> = Object.assign({}, this.filters);
    for(let key in this.specification.filters) {
      let definition = this.specification.filters[key];
      if(!(key in this.filters) && typeof(definition) !== 'function' && 'default' in definition) {
        filter[key] = definition.default;
      }
    }
    return filter as FilterImplementation<E, S>;
  }

  asTableHeader(): string[] {
    return Object.entries(this.all).map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
  }
}
