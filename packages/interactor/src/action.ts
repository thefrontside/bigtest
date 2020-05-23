export type ActionSpecification = Record<string, (element: HTMLElement) => unknown>

export type ActionImplementation<T extends ActionSpecification> = {
  [P in keyof T]: T[P] extends ((element: HTMLElement, ...args: infer TArgs) => infer TReturn) ? ((...args: TArgs) => Promise<TReturn>) : never;
}
