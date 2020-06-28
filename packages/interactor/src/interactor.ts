import { bigtestGlobals } from '@bigtest/globals';
import { converge } from './converge';
import { InteractorSpecification } from './specification';
import { Locator } from './locator';
import { NoSuchElementError, AmbiguousElementError, NotAbsentError } from './errors';
import { interaction, Interaction } from './interaction';

const defaultSelector = 'div';

export class Interactor<E extends Element, S extends InteractorSpecification<E>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ancestors: Array<Interactor<any, any>> = [];

  constructor(
    public name: string,
    private specification: S,
    private locator: Locator<E>
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  find<T extends Interactor<any, any>>(interactor: T): T {
    return Object.create(interactor, {
      ancestors: {
        value: [...this.ancestors, this, ...interactor.ancestors]
      }
    });
  }

  get description(): string {
    return this.ancestors.slice().reverse().reduce((desc, interactor) => {
      return `${desc} within ${interactor.name} ${interactor.locator.description}`
    }, `${this.name} ${this.locator.description}`);
  }

  private unsafeSyncResolve(): E {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ancestorChain: Array<Interactor<any, any>> = [...this.ancestors, this];

    return ancestorChain.reduce((parentElement: Element, interactor) => {
      let elements = Array.from(parentElement.querySelectorAll(interactor.specification.selector || defaultSelector));
      let matchingElements = elements.filter((element) => interactor.locator.matches(element));

      if(matchingElements.length === 1) {
        return matchingElements[0];
      } else if(matchingElements.length === 0) {
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
