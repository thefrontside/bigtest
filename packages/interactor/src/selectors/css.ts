import { selector } from '~/selector';

export const css = selector((locator, container) => container.querySelectorAll(locator));
