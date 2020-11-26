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

/**
 * Instances of an interactor returned by an {@link InteractorConstructor}, use
 * this class as its base. They are also extended with any additional actions
 * defined in their {@link InteractorSpecification}.
 */
export class Interactor<E extends Element, F extends Filters<E>, A extends Actions<E>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ancestors: Array<Interactor<any, any, any>> = [];

  /** @hidden */
  constructor(
    public name: string,
    public specification: InteractorSpecification<E, F, A>,
    public filter: Filter<E, F>,
    public locator?: Locator<E>,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get ancestorsAndSelf(): Array<Interactor<any, any, any>> {
    return [...this.ancestors, this];
  }

  /**
   * Returns a copy of the given interactor which is scoped to this interactor.
   * When there are multiple matches for an interactor, this makes it possible
   * to make them more specific by limiting the interactor to a section of the
   * page.
   *
   * ## Example
   *
   * ``` typescript
   * await Fieldset('Owner').find(TextField('Name')).fillIn('Jonas');
   * await Fieldset('Brand').find(TextField('Name')).fillIn('Volkswagen');
   * ```
   * @param interactor the interactor which should be scoped
   * @returns a scoped copy of the initial interactor
   * @typeParam T the type of the interactor that we are going to scope
   */
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

  /**
   * @returns a human readable description of this interactor
   */
  get description(): string {
    return this.ancestorsAndSelf.reverse().map((interactor) => interactor.ownDescription).join(' within ');
  }

  private unsafeSyncResolveParent(): Element {
    return this.ancestors.reduce(resolveUnique, bigtestGlobals.document.documentElement);
  }

  private unsafeSyncResolveUnique(): E {
    return resolveUnique(this.unsafeSyncResolveParent(), this) as E;
  }

  /**
   * Perform a one-off action on the given interactor. Takes a function which
   * receives an element. This function converges, which means that it is rerun
   * in a loop until it does not throw an error or times out.
   *
   * We recommend using this function for debugging only. You should normally
   * define an action in an {@link InteractorSpecification}.
   *
   * ## Example
   *
   * ``` typescript
   * await Link('Next').perform((e) => e.click());
   * ```
   */
  perform(fn: (element: E) => void): Interaction<void> {
    return interaction(`${this.description} performs`, () => {
      return converge(() => {
        fn(this.unsafeSyncResolveUnique());
      });
    });
  }

  /**
   * An assertion which checks that an element matching the interactor exists.
   * Throws an error if the element does not exist.
   *
   * ## Example
   *
   * ``` typescript
   * await Link('Next').exists();
   * ```
   */
  exists(): ReadonlyInteraction<void> {
    return check(`${this.description} exists`, () => {
      return converge(() => {
        resolveNonEmpty(this.unsafeSyncResolveParent(), this);
      });
    });
  }

  /**
   * An assertion which checks that an element matching the interactor does not
   * exist. Throws an error if the element exists.
   *
   * ## Example
   *
   * ``` typescript
   * await Link('Next').absent();
   * ```
   */
  absent(): ReadonlyInteraction<void> {
    return check(`${this.description} does not exist`, () => {
      return converge(() => {
        resolveEmpty(this.unsafeSyncResolveParent(), this);
      });
    });
  }

  /**
   * Checks that there is one element matching the interactor, and that this
   * element matches the given filters. The available filters are defined by
   * the {@link InteractorSpecification}.
   *
   * ## Example
   *
   * ``` typescript
   * await Link('Home').has({ href: '/' })
   * ```
   */
  has(filters: FilterParams<E, F>): ReadonlyInteraction<void> {
    return this.is(filters);
  }

  /**
   * Identical to {@link has}, but reads better with some filters.
   *
   * ## Example
   *
   * ``` typescript
   * await CheckBox('Accept conditions').is({ checked: true })
   * ```
   */
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
}
