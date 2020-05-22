import { converge } from './converge';

interface Options {
  timeout: number,
  document?: HTMLDocument
}

let defaultOptions: Options = {
  timeout: 1900
}

type ActionSpecification = Record<string, (element: HTMLElement) => unknown>

type ActionImplementation<T extends ActionSpecification> = {
  [P in keyof T]: T[P] extends ((element: HTMLElement, ...args: infer TArgs) => infer TReturn) ? ((...args: TArgs) => Promise<TReturn>) : never;
}

export interface InteractorSpecification {
  name: string,
  selector: string,
  defaultLocator: (element: HTMLElement) => string;
}

export type LocatorSpecification = string;

export class Interactor {
  constructor(private specification: InteractorSpecification, private locator: LocatorSpecification) {
  }

  async find(): Promise<HTMLElement> {
    return converge(defaultOptions.timeout, () => {
      if(!defaultOptions.document) {
        throw new Error('must specify document');
      }
      let elements = defaultOptions.document.querySelectorAll(this.specification.selector);

      let matchingElements = [].filter.call(elements, (element) => {
        return this.specification.defaultLocator(element) === this.locator
      });

      if(matchingElements.length === 1) {
        return matchingElements[0];
      } else if(matchingElements.length === 0) {
        throw new Error(`${this.specification.name} ${JSON.stringify(this.locator)} does not exist`);
      } else {
        throw new Error(`${this.specification.name} ${JSON.stringify(this.locator)} is ambiguous`);
      }
    });
  }

  async exists(): Promise<true> {
    await this.find();
    return true;
  }
}

export function interactor<A extends ActionSpecification>(specification: InteractorSpecification & { actions?: A }): (locator: LocatorSpecification) => Interactor & ActionImplementation<A> {
  return function(locator: LocatorSpecification) {
    let interactor = new Interactor(specification, locator);

    for(let [name, action] of Object.entries(specification.actions || {})) {
      Object.defineProperty(interactor, name, {
        value: async function() {
          let element = await this.find();
          return action(element);
        },
        configurable: true,
        writable: true,
        enumerable: false,
      });
    }

    return interactor as Interactor & ActionImplementation<A>;
  }
}

export function setDefaultOptions(options: Partial<Options>) {
  Object.assign(defaultOptions, options);
}
