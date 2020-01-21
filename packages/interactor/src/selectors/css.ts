import { selector } from '~/selector';

export const css = selector((container, locator) => container.querySelectorAll(locator));
