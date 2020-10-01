import { createInteractor, perform } from '../index';

export const Link = createInteractor<HTMLLinkElement>('link')({
  selector: 'a[href]',
  filters: {
    title: (element) => element.title,
    href: (element) => element.href,
    id: (element) => element.id,
  },
  actions: {
    click: perform((element) => { element.click(); })
  },
});
