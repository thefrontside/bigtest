import { when } from '~/when';
import { ActionsFactory, IUserActions, IActions, IBuiltIns, IActionContext } from './types';

interface IQueryContext<T extends Element> {
  element: T;
  locator: string;
}
interface ISelectorContext<T extends Element> {
  element: Promise<T>;
  locator: string;
}
type Query<T extends Element, R extends Element> = (context: IQueryContext<T>) => R | undefined | null;
type Selector<T extends Element, R extends Element> = (context: ISelectorContext<T>) => ISelectorContext<R>;

type Interactor<UserActions extends IUserActions> = (locator: string) => IActions<UserActions>;

export function selector<T extends Element, R extends Element>(query: Query<T, R>): Selector<T, R> {
  return ({ element, locator }) => {
    return { element: when(async () => query({ element: await element, locator })), locator };
  };
}

export function interactor<UserActions extends IUserActions>(
  selector: Selector,
  createUserActions: ActionsFactory<UserActions>
): Interactor<UserActions> {
  function createBuiltIns(subject: HTMLElement | null): IBuiltIns {
    return {
      $() {
        return when(() => subject);
      },

      async getText() {
        return (await when(() => subject)).innerText;
      },

      async click() {
        return (await when(() => subject)).click();
      }
    };
  }

  return locator => {
    const [matches] = selector([[document.body], locator]);
    const firstMatch = matches[0];
    const subject = createBuiltIns(firstMatch);

    return {
      ...createBuiltIns(firstMatch),
      ...createUserActions({ subject, locator })
    };
  };
}
