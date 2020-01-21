import { ActionsFactory, IUserActions, IActions, IBuiltIns, IActionContext } from './types';

type Interactor<UserActions extends IUserActions> = (locator: string) => IActions<UserActions>;

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
