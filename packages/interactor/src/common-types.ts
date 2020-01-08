export interface Selector<T extends Element> {
  (container: ParentNode): Array<T>;
  description: string;
}
