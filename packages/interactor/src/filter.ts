export type LocatorFn<E extends Element> = (element: E) => string;
import { Filters, FilterFn, FilterObject, FilterParams, InteractorSpecification } from './specification';
import { noCase } from 'change-case';

export class Filter<E extends Element, F extends Filters<E>> {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public specification: InteractorSpecification<E, F, any, any>,
    public filters: FilterParams<E, F>,
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

  get all(): FilterParams<E, F> {
    let filter: Record<string, unknown> = Object.assign({}, this.filters);
    for(let key in this.specification.filters) {
      let definition = this.specification.filters[key] as FilterFn<unknown, E> | FilterObject<unknown, E>;
      if(!(key in this.filters) && typeof(definition) !== 'function' && 'default' in definition) {
        filter[key] = definition.default;
      }
    }
    return filter as FilterParams<E, F>;
  }

  asTableHeader(): string[] {
    return Object.entries(this.all).map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
  }
}
