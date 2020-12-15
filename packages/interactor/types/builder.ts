import { createInteractor, perform } from '../src/index';

createInteractor<HTMLLinkElement>('link')
  .selector('a')
  .actions({
    click: perform(element => { element.click() }),
    setHref: perform((element, value: string) => { element.href = value })
  })
  .filters({
    title: (element) => element.title,
    href: (element) => element.href,
    id: (element) => element.id,
    visible: {
      apply: (element) => element.clientHeight > 0,
      default: true
    },
  })

