import { bigtestGlobals } from '@bigtest/globals';
import { converge } from './converge';
import { InteractorSpecification, FilterImplementation, InteractorInstance } from './specification';
import { Locator } from './locator';
import { Filter } from './filter';
import { NoSuchElementError, AmbiguousElementError, NotAbsentError, FilterNotMatchingError } from './errors';
import { interaction, Interaction } from './interaction';

const defaultSelector = 'div';

export class Interactor<E extends Element, S extends InteractorSpecification<E>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ancestors: Array<Interactor<E, S>> = [];

  constructor(
    public name: string,
    private specification: S,
    private locator: Locator<E>,
    private filter: Filter<E, S>
  ) {}

  private get ancestorsAndSelf(): Array<Interactor<E, S>> {
    return [...this.ancestors, this];
  }

  find<E extends Element, S extends InteractorSpecification<E>>(interactor: Interactor<E, S>): InteractorInstance<E, S> {
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
    return this.ancestorsAndSelf.reduce((parentElement: Element, interactor) => {
      let elements = Array.from(parentElement.querySelectorAll(interactor.specification.selector || defaultSelector));
      let locatedElements = elements.filter((element) => interactor.locator.matches(element as E));
      let filteredElements = locatedElements.filter((element) => interactor.filter.matches(element as E));

      if(filteredElements.length === 1) {
        return filteredElements[0];
      } else if(filteredElements.length === 0) {
        throw new NoSuchElementError(`${interactor.description} does not exist`);
      } else {
        throw new AmbiguousElementError(`${interactor.description} is ambiguous`);
      }
    }, bigtestGlobals.document.documentElement) as E;
  }

  resolve(): Interaction<E> {
    return interaction(`${this.description} resolves`, () => {
      return converge(this.unsafeSyncResolve.bind(this));
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
        if(filter.matches(element)) {
          return;
        } else {
          throw new FilterNotMatchingError(`${this.description} does not match filters: ${filter.description}`);
        }
      });
    });
  }

  has(filters: FilterImplementation<E, S>): Interaction<void> {
    return this.is(filters);
  }
}
