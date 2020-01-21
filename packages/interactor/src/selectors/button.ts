import { selector } from '~/selector';

export const button = selector((container, locator) =>
  Array.from(container.querySelectorAll('button')).filter(btn => btn.innerText === locator)
);
