import { bigtestGlobals } from '@bigtest/globals';
import { converge } from './converge';
import { Filters, Actions, FilterParams, InteractorSpecification } from './specification';
import { Filter } from './filter';
import { Locator } from './locator';
import { MatchFilter } from './match';
import { resolveUnique, resolveEmpty, resolveNonEmpty } from './resolve';
import { formatTable } from './format-table';
import { FilterNotMatchingError } from './errors';
import { interaction, check, Interaction, ReadonlyInteraction } from './interaction';

export class Interactor<E extends Element, F extends Filters<E>, A extends Actions<E>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ancestors: Array<Interactor<any, any, any>> = [];

  constructor(
    public name: string,
    public specification: InteractorSpecification<E, F, A>,
    public filter: Filter<E, F, A>,
    public locator?: Locator<E>,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get ancestorsAndSelf(): Array<Interactor<any, any, any>> {
    return [...this.ancestors, this];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  find<T extends Interactor<any, any, any>>(interactor: T): T {
    return Object.create(interactor, {
      ancestors: {
        value: [...this.ancestors, this, ...interactor.ancestors]
      }
    });
  }

  private get ownDescription(): string {
    if(this.locator) {
      return `${this.name} ${this.locator.description} ${this.filter.description}`.trim();
    } else {
      return `${this.name} ${this.filter.description}`.trim();
    }
  }

  get description(): string {
    return this.ancestorsAndSelf.reverse().map((interactor) => interactor.ownDescription).join(' within ');
  }

  private unsafeSyncResolveParent(): Element {
    return this.ancestors.reduce(resolveUnique, bigtestGlobals.document.documentElement);
  }

  private unsafeSyncResolveUnique(): E {
    return resolveUnique(this.unsafeSyncResolveParent(), this) as E;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  perform(fn: (element: E) => void): Interaction<void> {
    return interaction(`${this.description} performs`, () => {
      return converge(() => {
        fn(this.unsafeSyncResolveUnique());
      });
    });
  }

  exists(): ReadonlyInteraction<void> {
    return check(`${this.description} exists`, () => {
      return converge(() => {
        resolveNonEmpty(this.unsafeSyncResolveParent(), this);
      });
    });
  }

  absent(): ReadonlyInteraction<void> {
    return check(`${this.description} does not exist`, () => {
      return converge(() => {
        resolveEmpty(this.unsafeSyncResolveParent(), this);
      });
    });
  }

  is(filters: FilterParams<E, F>): ReadonlyInteraction<void> {
    let filter = new Filter(this.specification, filters);
    return check(`${this.description} matches filters: ${filter.description}`, () => {
      return converge(() => {
        let element = this.unsafeSyncResolveUnique();
        let match = new MatchFilter(element, filter);
        if(!match.matches) {
          let table = formatTable({ headers: filter.asTableHeader(), rows: [match.asTableRow()] });
          throw new FilterNotMatchingError(`${this.description} does not match filters:\n\n${table}`);
        }
      });
    });
  }

  has(filters: FilterParams<E, F>): ReadonlyInteraction<void> {
    return this.is(filters);
  }
}
