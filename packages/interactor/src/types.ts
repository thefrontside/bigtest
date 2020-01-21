export interface ISelectorContext {
  container: ParentNode;
  args: any[];
}

export interface ISelector<T extends Element> {
  (context: ISelectorContext): Array<T>;
  description: string;
}

export interface IBuiltIns {
  first(): Promise<Element>;
  all(): Promise<Array<Element>>;
  getText(): Promise<string>;
  click(): Promise<void>;
}

export interface IUserActions {
  [key: string]: (...args: any[]) => Promise<any>;
}

export type IActions<UserActions extends IUserActions> = (UserActions & IBuiltIns) | IBuiltIns;

export interface IActionContext {
  subject: IBuiltIns;
  locator: string;
}

export type ActionsFactory<UserActions extends IUserActions> = (context: IActionContext) => UserActions;
