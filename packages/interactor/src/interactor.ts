import { ActionsFactory, IUserActions, IActions, IBuiltIns } from '~/types';
import { Selector } from '~/selector';
import { when } from '~/when';
import { isHTMLElement } from '~/util';

type Interactor<UserActions extends IUserActions> = (locator: string) => IActions<UserActions>;

export function interactor<Elem extends Element, UserActions extends IUserActions>(
  selector: Selector<Elem>,
  createUserActions?: ActionsFactory<UserActions>
): Interactor<UserActions> {
  function createBuiltIns(matches: Promise<Array<Elem>>): IBuiltIns {
    return {
      async first() {
        return (await matches)[0];
      },

      all() {
        return matches;
      },

      async getText() {
        return when(async () => {
          const first = (await matches)[0];
          if (isHTMLElement(first)) return first.innerText;
          throw new Error('Element was expected to be an HTMLElement');
        });
      },

      async click() {
        const first = (await matches)[0];
        if (isHTMLElement(first)) return first.click();
        throw new Error('Element was expected to be an HTMLElement');
      }
    };
  }

  return locator => {
    const matches = selector(document.body, locator);
    const builtIns = createBuiltIns(matches);

    if (typeof createUserActions === 'function') {
      return {
        ...builtIns,
        ...createUserActions({ subject: builtIns, locator })
      };
    }

    return builtIns;
  };
}
