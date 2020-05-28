import { converge } from './converge';
import { ActionSpecification, ActionImplementation } from './action';
import { LocatorSpecification, LocatorArguments, Locator } from './locator';
import { defaultOptions } from './options';
import { NoSuchElementError, AmbigousElementError, NotAbsentError } from './errors';
import { interaction, Interaction } from './interaction';

export interface InteractorSpecification<E extends Element, L extends LocatorSpecification<E>> {
  selector: string;
  defaultLocator: (element: E) => string;
  locators: L;
}

const defaultSpecification: InteractorSpecification<Element, {}> = {
  selector: 'div',
  defaultLocator: (element) => element.textContent || "",
  locators: {},
}

export class Interactor {
  protected ancestors: Interactor[] = [];

  constructor(
    public name: string,
    private specification: InteractorSpecification<Element, LocatorSpecification<Element>>,
    private locator: Locator<Element>
  ) {}

  find<T extends Interactor>(interactor: T): T {
    let child = Object.create(interactor);
    child.ancestors = [...this.ancestors, this, ...interactor.ancestors];
    return child;
  }

  get description(): string {
    return this.ancestors.slice().reverse().reduce((desc, interactor) => {
      return `${desc} within ${interactor.name} ${interactor.locator.description}`
    }, `${this.name} ${this.locator.description}`);
  }

  protected unsafeSyncResolve(): Element {
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

  resolve(): Interaction<Element> {
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


export function interactor<E extends Element>(name: string) {
  return function<A extends ActionSpecification<E>, L extends LocatorSpecification<E>>(specification: Partial<InteractorSpecification<E, L>> & { actions?: A }) {
    return function(...locatorArgs: LocatorArguments<E, L>): Interactor & ActionImplementation<E, A> {
      let fullSpecification = Object.assign({ selector: name }, defaultSpecification, specification);
      let locator = new Locator(fullSpecification.defaultLocator, fullSpecification.locators, locatorArgs);
      let interactor = new Interactor(
        name,
        fullSpecification as unknown as InteractorSpecification<Element, LocatorSpecification<Element>>,
        locator as unknown as Locator<Element>
      );

      for(let [name, action] of Object.entries(specification.actions || {})) {
        Object.defineProperty(interactor, name, {
          value: function() {
            return interaction(`performing ${name} on ${this.description}`, () => {
              return converge(defaultOptions.timeout, () => {
                let element = this.unsafeSyncResolve();
                return action(element);
              });
            });
          },
          configurable: true,
          writable: true,
          enumerable: false,
        });
      }

      return interactor as Interactor & ActionImplementation<E, A>;
    }
  }
}
