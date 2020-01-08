import { when } from '~/when';
import { Selector } from '~/common-types';

export { button } from '~/selectors/button';
export { Selector };

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
  [Symbol.iterator](): Iterator<Element>;
  first(): IActions<UserActions>;
  second(): IActions<UserActions>;
  third(): IActions<UserActions>;
  last(): IActions<UserActions>;
  within(elem: Element): this;
  where(selector: string): this;
}

export function createInteractor<UserActions extends IUserActions>(
  defaultSelector: string | Selector<Element>,
  createUserActions: ActionsFactory<UserActions> = () => Object.create({}),
  container: ParentNode = document
): IInteractor<UserActions> {
  function getElements() {
    if (typeof defaultSelector === 'string') {
      return Array.from(container.querySelectorAll(defaultSelector));
    }

    return defaultSelector(container);
  }

  async function getElement(index: number) {
    const message =
      typeof defaultSelector === 'string'
        ? `Could not find "${defaultSelector}"`
        : defaultSelector.description;
    const elem = await when(() => getElements()[index], { message });

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
    [Symbol.iterator]() {
      return getElements()[Symbol.iterator]();
    },

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
    }
  };
}
