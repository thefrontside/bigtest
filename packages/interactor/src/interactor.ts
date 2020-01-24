import { Selector } from '~/selector';

interface ISubject<Elem> {
  first: Promise<Elem>;
  all: Promise<Elem[]>;
}

interface IActions {
  [key: string]: ((...args: any[]) => Promise<void>) | Promise<any>;
}

interface IActionContext<Elem> {
  subject: ISubject<Elem>;
  locator: string;
}

type ActionsFactory<Elem, Actions extends IActions> = (context: IActionContext<Elem>) => Actions;

type AnyFunction = (...args: any[]) => any;

interface IDict<T = any> {
  [key: string]: T;
}

type Chainable<Interface extends IDict<AnyFunction | Promise<any>>> = {
  [Key in keyof Interface]: Interface[Key] extends AnyFunction
    ? (...args: Parameters<Interface[Key]>) => Chainable<Interface> & Promise<void>
    : Interface[Key];
};

type Interactor<Actions extends IActions> = (
  locator?: string,
  container?: ISubject<any>,
  options?: IInteractorOptions
) => Chainable<Actions>;

interface IInteractorOptions {
  waitFor?: Promise<void>;
}

interface IInteractorFactoryOptions {
  locator?: string;
  container?: Element;
}

function isSubject<T>(obj: any): obj is ISubject<T> {
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

export function interactor<Elem extends Element, Actions extends IActions>(
  selector: Selector<Elem>,
  actionsFactory: ActionsFactory<Elem, Actions> = () => Object.create({}),
  { locator: defaultLocator = '', container: defaultContainer = document.body }: IInteractorFactoryOptions = {
    locator: '',
    container: document.body
  }
): Interactor<Actions> {
  return (locator, container, options) => {
    const getLocator = () => locator || defaultLocator;
    const { waitFor = Promise.resolve() } = options || {
      waitFor: Promise.resolve()
    };
    const actions = actionsFactory({
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

    return new Proxy(Object.create({}), {
      get(_, key, receiver) {
        const actionOrGetter = Reflect.get(actions, key, receiver);

        if (typeof actionOrGetter === 'function') {
          return (...args: any[]) => {
            const previousAction = Promise.resolve()
              .then(() => actionOrGetter(...args))
              .then(() => {
                // Swallow any return value from the action
              });
            const actions = interactor(selector, actionsFactory, {
              container: defaultContainer,
              locator: defaultLocator
            })(locator, container, { waitFor: previousAction });

            return new Proxy(Object.create({}), {
              get(_, key, receiver) {
                if (key === 'then') {
                  return previousAction.then.bind(previousAction);
                }
                return Reflect.get(actions, key, receiver);
              }
            });
          };
        }

        return actionOrGetter;
      }
    });
  };
}
