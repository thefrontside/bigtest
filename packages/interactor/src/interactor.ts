import { converge } from './converge';
import { ActionSpecification, ActionImplementation } from './action';
import { LocatorSpecification, LocatorArguments, Locator } from './locator';
import { defaultOptions } from './options';

export interface InteractorSpecification<L extends LocatorSpecification> {
  name: string;
  selector: string;
  defaultLocator: (element: HTMLElement) => string;
  locators: L;
}

export class Interactor {
  protected parent?: Interactor;

  constructor(private specification: InteractorSpecification<LocatorSpecification>, private locator: Locator) {
  }

  find<T extends Interactor>(interactor: T): T {
    let child = Object.create(interactor);
    child.parent = this;
    return child;
  }

  get description(): string {
    let desc = `${this.specification.name} ${this.locator.description}`
    if(this.parent) {
      desc += ` within ${this.parent.description}`;
    }
    return desc;
  }

  private unsafeFindMatching(): HTMLElement[] {
    let root: HTMLElement | HTMLDocument;

    if(this.parent) {
      root = this.parent.unsafeSyncResolve();
    } else {
      if(!defaultOptions.document) {
        throw new Error('must specify document');
      }
      root = defaultOptions.document;
    }

    let elements = root.querySelectorAll(this.specification.selector);

    return [].filter.call(elements, (element) => this.locator.matches(element));
  }

  protected unsafeSyncResolve(): HTMLElement {
    let matchingElements = this.unsafeFindMatching();
    if(matchingElements.length === 1) {
      return matchingElements[0];
    } else if(matchingElements.length === 0) {
      throw new Error(`${this.description} does not exist`);
    } else {
      throw new Error(`${this.description} is ambiguous`);
    }
  }

  async resolve(): Promise<HTMLElement> {
    return converge(defaultOptions.timeout, this.unsafeSyncResolve.bind(this));
  }

  async exists(): Promise<true> {
    await this.resolve();
    return true;
  }

  async absent(): Promise<true> {
    return converge(defaultOptions.timeout, () => {
      let matchingElements = this.unsafeFindMatching();
      if(matchingElements.length === 0) {
        return true;
      } else {
        throw new Error(`${this.description} exists but should not`);
      }
    });
  }
}

export function interactor<A extends ActionSpecification, L extends LocatorSpecification>(
  specification: InteractorSpecification<L> & { actions?: A }
): (...locatorArgs: LocatorArguments<L>) => Interactor & ActionImplementation<A> {
  return function(...locatorArgs) {
    let locator = new Locator(specification.defaultLocator, specification.locators, locatorArgs);
    let interactor = new Interactor(specification, locator as unknown as Locator);

    for(let [name, action] of Object.entries(specification.actions || {})) {
      Object.defineProperty(interactor, name, {
        value: async function() {
          await converge(defaultOptions.timeout, () => {
            let element = this.unsafeSyncResolve();
            return action(element);
          });
        },
        configurable: true,
        writable: true,
        enumerable: false,
      });
    }

    return interactor as Interactor & ActionImplementation<A>;
  }
}
