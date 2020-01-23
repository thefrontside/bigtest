import { Selector } from '~/selector';

interface ISubject<Elem extends Element> {
  first: Promise<Elem>;
  all: Promise<Elem[]>;
}

interface IUserActions {
  [key: string]: ((...args: any[]) => Promise<void>) | Promise<any>;
}

interface IActionContext<Elem extends Element> {
  subject: ISubject<Elem>;
  locator: string;
}

type ActionsFactory<Elem extends Element, UserActions extends IUserActions> = (
  context: IActionContext<Elem>
) => UserActions;

type AnyFunction = (...args: any[]) => any;

interface IDict<T = any> {
  [key: string]: T;
}

type Chainable<Interface extends IDict<AnyFunction | Promise<any>>> = {
  [Key in keyof Interface]: Interface[Key] extends AnyFunction
    ? (...args: Parameters<Interface[Key]>) => Chainable<Interface> & Promise<void>
    : Interface[Key];
};

type Interactor<UserActions extends IUserActions> = (
  locator?: string,
  container?: ISubject<Element> | Element | null | undefined,
  options?: IInteractorOptions
) => Chainable<UserActions>;

interface IInteractorOptions {
  waitFor?: Promise<void>;
}

interface IInteractorFactoryOptions {
  locator?: string;
  container?: Element;
}

function isSubject(obj: any): obj is ISubject<Element> {
  return obj && obj.hasOwnProperty('first') && obj.hasOwnProperty('all');
}

function createSubject<Elem extends Element>(matches: Promise<Array<Elem>>): ISubject<Elem> {
  return {
    get first() {
      return matches.then(matches => matches[0]);
    },

    get all() {
      return matches;
    }
  };
}

export function interactor<Elem extends Element, UserActions extends IUserActions>(
  selector: Selector<Elem>,
  createActions: ActionsFactory<Elem, UserActions> = () => Object.create({}),
  { locator: defaultLocator = '', container: defaultContainer = document.body }: IInteractorFactoryOptions = {
    locator: '',
    container: document.body
  }
): Interactor<UserActions> {
  return (locator, container, options) => {
    const getLocator = () => locator || defaultLocator;
    const { waitFor = Promise.resolve() } = options || {
      waitFor: Promise.resolve()
    };
    const actions = createActions({
      subject: createSubject(
        waitFor.then(async () => {
          if (isSubject(container)) {
            return selector(getLocator(), await container.first);
          }
          return selector(getLocator(), container || defaultContainer);
        })
      ),
      locator: getLocator()
    });

    return new Proxy(actions, {
      get(target, key, receiver) {
        const prop = Reflect.get(target, key, receiver);

        if (typeof prop === 'function') {
          return (...args: any[]) => {
            const previousAction = prop(...args);
            return interactor(selector, createActions, {
              container: defaultContainer,
              locator: defaultLocator
            })(locator, container, { waitFor: previousAction });
          };
        }

        return prop;
      }
    }) as Chainable<UserActions>;
  };
}
