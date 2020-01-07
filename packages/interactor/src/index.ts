import { when } from '~/when';

const actions = Symbol('#actions');

interface IBuiltIns {
  $(): Promise<HTMLElement>;
  text(): Promise<string>;
  click(): Promise<void>;
}

interface IUserActions {
  [key: string]: (...args: any[]) => Promise<any>;
}

type IActions<UserActions extends IUserActions> = UserActions & IBuiltIns;

type ActionsFactory<UserActions extends IUserActions> = (elem: Promise<HTMLElement>) => UserActions;

interface IInteractor<UserActions extends IUserActions> {
  first(): IActions<UserActions>;
  second(): IActions<UserActions>;
  third(): IActions<UserActions>;
  last(): IActions<UserActions>;
  within(elem: Element): this;
  where(selector: string): this;
  select<UserActions extends IUserActions>(
    collection: IInteractor<UserActions>,
    selector: string
  ): IInteractor<UserActions>;
  [actions]: ActionsFactory<UserActions>;
}

export function createInteractor<UserActions extends IUserActions>(
  defaultSelector: string,
  createUserActions: ActionsFactory<UserActions> = () => Object.create({}),
  container: ParentNode = document
): IInteractor<UserActions> {
  function getElements() {
    return container.querySelectorAll(defaultSelector);
  }

  async function getElement(index: number) {
    let elem = await when(() => getElements()[index]);

    function isHtmlElement(e: Element & { click?: unknown }): e is HTMLElement {
      return typeof e.click === 'function';
    }

    if (!isHtmlElement(elem)) {
      throw new Error('Expected an `HTMLElement` but did not find one');
    }

    return elem;
  }

  function createBuiltIns(elem: Promise<HTMLElement>): IBuiltIns {
    return {
      $() {
        return elem;
      },

      async text() {
        return (await elem).innerText;
      },

      async click() {
        return (await elem).click();
      }
    };
  }

  function createActions(elem: Promise<HTMLElement>): IActions<UserActions> {
    return {
      ...createBuiltIns(elem),
      ...createUserActions(elem)
    };
  }

  return {
    [actions]: createUserActions,

    first() {
      return createActions(getElement(0));
    },

    second() {
      return createActions(getElement(1));
    },

    third() {
      return createActions(getElement(2));
    },

    last() {
      return createActions(getElement(getElements().length - 1));
    },

    within(elem) {
      return createInteractor(defaultSelector, createUserActions, elem);
    },

    where(selector) {
      return createInteractor(selector, createUserActions);
    },

    select(newInteractor, newSelector) {
      return createInteractor(`${defaultSelector} ${newSelector}`, newInteractor[actions]);
    }
  };
}
