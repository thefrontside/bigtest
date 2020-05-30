import { converge } from './converge';
import { InteractorSpecification } from './specification';
import { Locator } from './locator';
import { defaultOptions } from './options';
import { NoSuchElementError, AmbigousElementError, NotAbsentError } from './errors';
import { interaction } from './interaction';

export class Interactor {
  private ancestors: Interactor[] = [];

  constructor(
    public name: string,
    private specification: InteractorSpecification<Element>,
    private locator: Locator<Element>
  ) {}

  find<T extends Interactor>(interactor: T): T {
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

  private unsafeSyncResolve(): Element {
    let root = defaultOptions.document?.documentElement;

    if(!root) {
      throw new Error('must specify document');
    }

    return [...this.ancestors, this].reduce((parentElement: Element, interactor) => {
      let elements = Array.from(parentElement.querySelectorAll(interactor.specification.selector));
      let matchingElements = elements.filter((element) => interactor.locator.matches(element));

      if(matchingElements.length === 1) {
        return matchingElements[0];
      } else if(matchingElements.length === 0) {
        throw new NoSuchElementError(`${interactor.description} does not exist`);
      } else {
        throw new AmbigousElementError(`${interactor.description} is ambiguous`);
      }
    }, root);
  }

  resolve(){
    return interaction(`${this.description} resolves`, () => {
      return converge(defaultOptions.timeout, this.unsafeSyncResolve.bind(this));
    });
  }

  exists() {
    return interaction(`${this.description} exists`, () => {
      return converge(defaultOptions.timeout, () => {
        this.unsafeSyncResolve();
        return true;
      });
    });
  }

  absent() {
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
