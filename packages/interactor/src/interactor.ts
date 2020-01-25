import { Selector } from '~/selector';

interface ISubject<Elem> {
  first: Promise<Elem>;
  all: Promise<Elem[]>;
}

type Action = (...args: any[]) => Promise<void>;

interface IActions {
  [key: string]: Action | Promise<any>;
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

type Interactor<Container, Actions extends IActions> = (
  locator?: string,
  container?: ISubject<Container> | Container,
  options?: IInteractorOptions
) => Chainable<Actions>;

interface IInteractorOptions {
  waitFor?: Promise<void>;
}

interface IInteractorFactoryOptions<Container> {
  locator?: string;
  container?: Container;
}

function isSubject<T>(obj: any): obj is ISubject<T> {
  return obj && obj.hasOwnProperty('first') && obj.hasOwnProperty('all');
}

function createSubject<Elem>(matches: Promise<Array<Elem>>): ISubject<Elem> {
  return {
    get first() {
      return matches.then(matches => matches[0]);
    },

    get all() {
      return matches;
    }
  };
}

function isAction(actionOrGetter: any): actionOrGetter is Action {
  return typeof actionOrGetter === 'function';
}

export function interactor<Container, Elem, Actions extends IActions>(
  selector: Selector<Container, Elem>,
  actionsFactory: ActionsFactory<Elem, Actions> = () => Object.create({}),
  {
    locator: defaultLocator = '',
    container: defaultContainer = document.body as any
  }: IInteractorFactoryOptions<Container> = {
    locator: '',
    container: document.body as any
  }
): Interactor<Container, Actions> {
  return (
    locator = defaultLocator,
    container = defaultContainer,
    options = {
      waitFor: Promise.resolve()
    }
  ) => {
    const { waitFor = Promise.resolve() } = options;
    const actions = actionsFactory({
      subject: createSubject(
        waitFor.then(async () => {
          if (isSubject<Container>(container)) {
            return selector(locator, await container.first);
          }
          return selector(locator, container);
        })
      ),
      locator
    });

    return new Proxy(Object.create({}), {
      get(_, key, receiver) {
        const actionOrGetter = Reflect.get(actions, key, receiver);

        if (!isAction(actionOrGetter)) {
          return actionOrGetter;
        }

        return (...args: any[]) => {
          return new Proxy(Object.create({}), {
            get(_, key, receiver) {
              const previousAction = Promise.resolve()
                .then(() => actionOrGetter(...args))
                .then(() => {
                  // Swallow any return value from the action
                });

              if (key === 'then') {
                return (...args: any[]) => previousAction.then(...args);
              }

              const actions = interactor(selector, actionsFactory, {
                container: defaultContainer,
                locator: defaultLocator
              })(locator, container, { waitFor: previousAction });

              return Reflect.get(actions, key, receiver);
            }
          });
        };
      }
    });
  };
}
