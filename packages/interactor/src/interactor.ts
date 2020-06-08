import { bigtestGlobals } from '@bigtest/globals';
import { converge } from './converge';
import { InteractorSpecification } from './specification';
import { Locator } from './locator';
import { Filter } from './filter';
import { NoSuchElementError, AmbiguousElementError, NotAbsentError } from './errors';
import { interaction, Interaction } from './interaction';

const defaultSelector = 'div';

export class Interactor<E extends Element, S extends InteractorSpecification<E>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ancestors: Array<Interactor<any, any>> = [];

  constructor(
    public name: string,
    private specification: S,
    private locator: Locator<E>,
    private filter: Filter<E, S>
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
    return this.ancestorsAndSelf.reduce((parentElement: Element, interactor) => {
      let elements = Array.from(parentElement.querySelectorAll(interactor.specification.selector || defaultSelector));
      let locatedElements = elements.filter((element) => interactor.locator.matches(element));
      let filteredElements = locatedElements.filter((element) => interactor.filter.matches(element));

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

  exists(): Interaction<true> {
    return interaction(`${this.description} exists`, () => {
      return converge(() => {
        this.unsafeSyncResolve();
        return true;
      });
    });
  }

  absent(): Interaction<true> {
    return interaction(`${this.description} does not exist`, () => {
      return converge(() => {
        try {
          this.unsafeSyncResolve();
        } catch(e) {
          if(e.name === 'NoSuchElementError') {
            return true;
          }
        }
        throw new NotAbsentError(`${this.description} exists but should not`);
      });
    });
  }
}
