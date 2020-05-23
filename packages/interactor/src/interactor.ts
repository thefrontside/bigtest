import { converge } from './converge';
import { ActionSpecification, ActionImplementation } from './action';
import { defaultOptions } from './options';

export type LocatorSpecification = Record<string, (element: HTMLElement) => string>

export interface InteractorSpecification<L extends LocatorSpecification> {
  name: string;
  selector: string;
  defaultLocator: (element: HTMLElement) => string;
  locators?: L;
}

export type Locator<L extends LocatorSpecification> = [string] | [keyof L, string]

export class Interactor<L extends LocatorSpecification> {
  protected parent?: Interactor<LocatorSpecification>;

  constructor(private specification: InteractorSpecification<L>, private locator: Locator<L>) {
  }

  find<LT extends LocatorSpecification, T extends Interactor<LT>>(interactor: T): T {
    let child = Object.create(interactor);
    child.parent = this;
    return child;
  }

  get description(): string {
    let desc: string;
    if(this.locator.length === 1) {
      desc = `${this.specification.name} ${JSON.stringify(this.locator[0])}`;
    } else {
      desc = `${this.specification.name} with ${this.locator[0]} ${JSON.stringify(this.locator[1])}`;
    }
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

    return [].filter.call(elements, (element) => {
      if(this.locator.length === 2) {
        let locator = this.specification.locators && this.specification.locators[this.locator[0]];

        if(!locator) {
          throw new  Error(`unknown locator '${this.locator[0]}'`);
        }

        return locator(element) === this.locator[1];
      } else {
        return this.specification.defaultLocator(element) === this.locator[0];
      }
    });
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
): (...locator: Locator<L>) => Interactor<L> & ActionImplementation<A> {
  return function(...locator) {
    let interactor = new Interactor(specification, locator);

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

    return interactor as Interactor<L> & ActionImplementation<A>;
  }
}
