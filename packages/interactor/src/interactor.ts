import { bigtestGlobals } from '@bigtest/globals';
import { converge } from './converge';
import { InteractorSpecification, FilterImplementation } from './specification';
import { Locator } from './locator';
import { Filter } from './filter';
import { MatchFilter } from './match';
import { resolve } from './resolve';
import { formatTable } from './format-table';
import { NotAbsentError, FilterNotMatchingError } from './errors';
import { interaction, Interaction } from './interaction';

export class Interactor<E extends Element, S extends InteractorSpecification<E>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ancestors: Array<Interactor<any, any>> = [];

  constructor( public name: string,
    public specification: S,
    public locator: Locator<E>,
    public filter: Filter<E, S>
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get ancestorsAndSelf(): Array<Interactor<any, any>> {
    return [...this.ancestors, this];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  find<T extends Interactor<any, any>>(interactor: T): T {
    return Object.create(interactor, {
      ancestors: {
        value: [...this.ancestors, this, ...interactor.ancestors]
      }
    });
  }

  get description(): string {
    return this.ancestorsAndSelf.reverse().map((interactor) => {
      return `${interactor.name} ${interactor.locator.description} ${interactor.filter.description}`.trim();
    }).join(' within ');
  }

  private unsafeSyncResolve(): E {
    return this.ancestorsAndSelf.reduce(resolve, bigtestGlobals.document.documentElement) as E;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  perform(fn: (element: E) => void): Interaction<void> {
    return interaction(`${this.description} performs`, () => {
      return converge(() => {
        fn(this.unsafeSyncResolve());
      });
    });
  }

  exists(): Interaction<void> {
    return interaction(`${this.description} exists`, () => {
      return converge(() => {
        this.unsafeSyncResolve();
      });
    });
  }

  absent(): Interaction<void> {
    return interaction(`${this.description} does not exist`, () => {
      return converge(() => {
        try {
          this.unsafeSyncResolve();
        } catch(e) {
          if(e.name === 'NoSuchElementError') {
            return;
          }
        }
        throw new NotAbsentError(`${this.description} exists but should not`);
      });
    });
  }

  is(filters: FilterImplementation<E, S>): Interaction<void> {
    let filter = new Filter(this.specification, filters);
    return interaction(`${this.description} matches filters: ${filter.description}`, () => {
      return converge(() => {
        let element = this.unsafeSyncResolve();
        let match = new MatchFilter(filter, element);
        if(!match.matches) {
          let table = formatTable({ headers: filter.asTableHeader(), rows: [match.asTableRow()] });
          throw new FilterNotMatchingError(`${this.description} does not match filters:\n\n${table}`);
        }
      });
    });
  }

  has(filters: FilterImplementation<E, S>): Interaction<void> {
    return this.is(filters);
  }
}
