import { Selector } from '~/selector';
import { isHTMLElement, isHTMLInputElement } from '~/util';

export interface ISubject<Elem extends Element> {
  $(): Promise<Elem>;
  $$(): Promise<Elem[]>;
  first(): IBuiltIns;
  all(): Promise<Array<IBuiltIns>>;
}

export interface IBuiltIns {
  text: Promise<string>;
  value: Promise<string>;
  click(): Promise<void>;
  fill(val: string): Promise<void>;
  keyPress(code: string): Promise<void>;
}

export interface IUserActions {
  [key: string]: ((...args: any[]) => Promise<void>) | Promise<any>;
}

export interface IActionContext<Elem extends Element> {
  subject: ISubject<Elem>;
  locator: string;
}

export type ActionsFactory<Elem extends Element, UserActions extends IUserActions> = (
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

export type Interactor<UserActions extends IUserActions> = (
  locator: string,
  container?: ISubject<Element> | Element | null | undefined,
  options?: IInteractorOptions
) => Chainable<IBuiltIns & UserActions>;

export interface IInteractorOptions {
  waitFor?: Promise<void>;
}

function isSubject(obj: any): obj is ISubject<Element> {
  return (
    obj &&
    typeof obj.$ === 'function' &&
    typeof obj.$$ === 'function' &&
    typeof obj.first === 'function' &&
    typeof obj.all === 'function'
  );
}

export function interactor<Elem extends Element, UserActions extends IUserActions>(
  selector: Selector<Elem>,
  createUserActions: ActionsFactory<Elem, UserActions> = () => Object.create({})
): Interactor<UserActions> {
  function createSubject(matches: Promise<Array<Elem>>): ISubject<Elem> {
    return {
      async $() {
        return (await matches)[0];
      },

      $$() {
        return matches;
      },

      first() {
        return createBuiltIns(matches.then(ms => ms[0]));
      },

      async all() {
        return (await matches).map(m => createBuiltIns(Promise.resolve(m)));
      }
    };
  }

  function createBuiltIns(elem: Promise<Elem>): IBuiltIns {
    return {
      get text() {
        return elem.then(e => {
          if (isHTMLElement(e)) return e.innerText;
          throw new Error('Element was expected to be an HTMLElement');
        });
      },

      get value() {
        return elem.then(e => {
          if (isHTMLInputElement(e)) return e.value;
          throw new Error('Element was expected to be an HTMLInputElement');
        });
      },

      async click() {
        const e = await elem;
        if (isHTMLElement(e)) {
          e.click();
          return;
        }
        throw new Error('Element was expected to be an HTMLElement');
      },

      async fill(val: string) {
        const e = await elem;
        if (isHTMLInputElement(e)) {
          e.value = val;
          return;
        }
        throw new Error('Element was expected to be an HTMLInputElement');
      },

      async keyPress(code: string) {
        const e = await elem;
        e.dispatchEvent(
          new KeyboardEvent('keypress', {
            code
          })
        );
      }
    };
  }

  function createActions(subject: ISubject<Elem>, locator: string) {
    const builtIns = createBuiltIns(subject.$());
    const userActions = createUserActions({ subject, locator });

    return new Proxy(
      {},
      {
        get(_, key, receiver) {
          if (userActions.hasOwnProperty(key)) {
            return Reflect.get(userActions, key, receiver);
          }
          return Reflect.get(builtIns, key, receiver);
        }
      }
    ) as IBuiltIns & UserActions;
  }

  return (locator, container, options) => {
    const { waitFor = Promise.resolve() } = options || {
      waitFor: Promise.resolve()
    };
    const actions = createActions(
      createSubject(
        waitFor.then(async () => {
          if (isSubject(container)) {
            return selector(locator, await container.$());
          }
          return selector(locator, container || document.body);
        })
      ),
      locator
    );

    return new Proxy(actions, {
      get(target, key, receiver) {
        const prop = Reflect.get(target, key, receiver);

        if (typeof prop === 'function') {
          return (...args: any[]) => {
            // Swallowing the return value to keep actions effectual only
            const previousAction = prop(...args).then(() => {});
            return interactor(selector, createUserActions)(locator, container, { waitFor: previousAction });
          };
        }

        return prop;
      }
    }) as Chainable<IBuiltIns & UserActions>;
  };
}
