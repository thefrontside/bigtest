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
  (index?: number): IActions<UserActions>;
  [Symbol.iterator](): Iterator<Element>;
  within(elem: Element): IInteractor<UserActions>;
  where(selector: string | Selector<Element>): IInteractor<UserActions>;
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

  function interactor(index = 0) {
    return createActions(getElement(index));
  }

  return Object.assign(interactor, {
    [Symbol.iterator]() {
      return getElements()[Symbol.iterator]();
    },

    within(elem: Element) {
      return createInteractor(defaultSelector, createUserActions, elem);
    },

    where(selector: string | Selector<Element>) {
      return createInteractor(selector, createUserActions);
    }
  });
}
