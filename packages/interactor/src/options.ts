export interface Options {
  timeout: number;
  document?: Document;
}

export const defaultOptions: Options = {
  document: (typeof(window) === 'object') ? window.document : undefined,
  timeout: 1900
}

export function setDefaultOptions(options: Partial<Options>) {
  Object.assign(defaultOptions, options);
}
