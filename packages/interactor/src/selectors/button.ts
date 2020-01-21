import { selector } from '~/selector';

export const button = selector((locator, container) =>
  Array.from(container.querySelectorAll('button')).filter(btn => btn.innerText === locator)
);
