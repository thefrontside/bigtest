export interface Options {
  timeout: number;
  document?: HTMLDocument;
}

export const defaultOptions: Options = {
  timeout: 1900
}

export function setDefaultOptions(options: Partial<Options>) {
  Object.assign(defaultOptions, options);
}
