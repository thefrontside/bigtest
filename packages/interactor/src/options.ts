export interface Options {
  timeout: number;
  actionsDisabled: boolean | string;
  document?: Document;
}

export const defaultOptions: Options = {
  document: (typeof(window) === 'object') ? window.document : undefined,
  actionsDisabled: false,
  timeout: 1900
}

export function setDefaultOptions(options: Partial<Options>) {
  Object.assign(defaultOptions, options);
}
