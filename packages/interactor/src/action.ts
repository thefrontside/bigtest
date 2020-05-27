export type ActionSpecification<E extends Element> = Record<string, (element: E) => unknown>

export type ActionImplementation<E extends Element, T extends ActionSpecification<E>> = {
  [P in keyof T]: T[P] extends ((element: E, ...args: infer TArgs) => infer TReturn) ? ((...args: TArgs) => Promise<TReturn>) : never;
}
