import { createInteractor, perform } from '../src/index';

let Link = createInteractor<HTMLLinkElement>('link')
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

const Div = createInteractor('div')
  .locator((element) => element.id || "")

Link('foo').click();

Link('foo').setHref('blah');

// cannot use wrong type of argument on action
// $ExpectError
Link('foo').setHref(123);

// cannot use action which is not defined
// $ExpectError
Div('foo').click();

// $ExpectError
Link('foo').blah();

// $ExpectError
Div('foo').blah();
