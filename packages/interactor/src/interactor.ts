import { Selector } from '~/selector';
import { isHTMLElement } from '~/util';

export interface ISubject<Elem extends Element> {
  $(): Promise<Elem>;
  $$(): Promise<Elem[]>;
  first(): IBuiltIns;
  all(): Promise<Array<IBuiltIns>>;
}

export interface IBuiltIns {
  getText(): Promise<string>;
  click(): Promise<void>;
}

export interface IUserActions {
  [key: string]: (...args: any[]) => Promise<any>;
}

export interface IActionContext<Elem extends Element> {
  subject: ISubject<Elem>;
  locator: string;
}

export type ActionsFactory<Elem extends Element, UserActions extends IUserActions> = (
  context: IActionContext<Elem>
) => UserActions;

export type Interactor<UserActions extends IUserActions> = (locator: string) => UserActions & IBuiltIns;

export interface IInteractorOptions {
  within?: Element;
}

export function interactor<Elem extends Element, UserActions extends IUserActions>(
  selector: Selector<Elem>,
  createUserActions: ActionsFactory<Elem, UserActions> = () => Object.create({}),
  { within = document.body }: IInteractorOptions = { within: document.body }
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
      async getText() {
        const e = await elem;
        if (isHTMLElement(e)) return e.innerText;
        throw new Error('Element was expected to be an HTMLElement');
      },

      async click() {
        const e = await elem;
        if (isHTMLElement(e)) return e.click();
        throw new Error('Element was expected to be an HTMLElement');
      }
    };
  }

  return locator => {
    const matches = selector(within, locator);
    const subject = createSubject(matches);

    return {
      ...createBuiltIns(subject.$()),
      ...createUserActions({ subject, locator })
    };
  };
}
