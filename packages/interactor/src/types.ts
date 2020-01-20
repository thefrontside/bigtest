export interface ISelectorContext {
  container: ParentNode;
  args: any[];
}

export interface ISelector<T extends Element> {
  (context: ISelectorContext): Array<T>;
  description: string;
}

export interface IBuiltIns {
  $(): Promise<HTMLElement>;
  getText(): Promise<string>;
  click(): Promise<void>;
}

export interface IUserActions {
  [key: string]: (...args: any[]) => Promise<any>;
}

export type IActions<UserActions extends IUserActions> = UserActions & IBuiltIns;

export interface IActionContext {
  subject: IBuiltIns;
  locator: string;
}

export type ActionsFactory<UserActions extends IUserActions> = (context: IActionContext) => UserActions;

export interface IInteractor<UserActions extends IUserActions> extends Iterable<Element> {
  (...selectorArgs: any[]): IActions<UserActions>;
  [Symbol.iterator](): Iterator<Element>;
  within(elem: Element): IInteractor<UserActions>;
  where(selector: ISelector<Element>): IInteractor<UserActions>;
}
