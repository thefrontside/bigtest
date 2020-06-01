import { converge } from './converge';
import { InteractorSpecification } from './specification';
import { Locator } from './locator';
import { defaultOptions } from './options';
import { NoSuchElementError, AmbigousElementError, NotAbsentError } from './errors';
import { interaction, Interaction } from './interaction';

export class Interactor<E extends Element> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ancestors: Interactor<any>[] = [];

  constructor(
    public name: string,
    private specification: InteractorSpecification<E>,
    private locator: Locator<E>
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  find<T extends Interactor<any>>(interactor: T): T {
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
    let root = defaultOptions.document?.documentElement;

    if(!root) {
      throw new Error('must specify document');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ancestorChain: Interactor<any>[] = [...this.ancestors, this];

    return ancestorChain.reduce((parentElement: Element, interactor) => {
      let elements = Array.from(parentElement.querySelectorAll(interactor.specification.selector));
      let matchingElements = elements.filter((element) => interactor.locator.matches(element));

      if(matchingElements.length === 1) {
        return matchingElements[0];
      } else if(matchingElements.length === 0) {
        throw new NoSuchElementError(`${interactor.description} does not exist`);
      } else {
        throw new AmbigousElementError(`${interactor.description} is ambiguous`);
      }
    }, root) as E;
  }

  resolve(): Interaction<E> {
    return interaction(`${this.description} resolves`, () => {
      return converge(defaultOptions.timeout, this.unsafeSyncResolve.bind(this));
    });
  }

  exists(): Interaction<true> {
    return interaction(`${this.description} exists`, () => {
      return converge(defaultOptions.timeout, () => {
        this.unsafeSyncResolve();
        return true;
      });
    });
  }

  absent(): Interaction<true> {
    return interaction(`${this.description} does not exist`, () => {
      return converge(defaultOptions.timeout, () => {
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
