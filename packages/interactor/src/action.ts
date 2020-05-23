export type ActionSpecification<E extends HTMLElement> = Record<string, (element: E) => unknown>

export type ActionImplementation<E extends HTMLElement, T extends ActionSpecification<E>> = {
  [P in keyof T]: T[P] extends ((element: E, ...args: infer TArgs) => infer TReturn) ? ((...args: TArgs) => Promise<TReturn>) : never;
}
