import { createInteractor } from '../src/index';

const Link = createInteractor<HTMLLinkElement>('link')({
  selector: 'a',
  locators: {
    byHref: (element) => element.href,
    byTitle: (element) => element.title
  },
  actions: {
    click: ({ element }) => { element.click() },
    setHref: ({ element }, value: string) => { element.href = value }
  }
});

const Div = createInteractor('div')({
  defaultLocator: (element) => element.id || "",
});

Link('foo').click();

Link('foo').setHref('blah');

// cannot use wrong type of argument on action
// $ExpectError
Link('foo').setHref(123);

// cannot use action which is not defined
// $ExpectError
Div('foo').click();

// $ExpectError
Div('foo').blah();

Link.byHref('foobar');

// cannot use wrong type argument on locator
// $ExpectError
Link.byHref(123);

// cannot use locator which is not defined
// $ExpectError
Div.byHref('foobar');

// $ExpectError
Div.moo('foobar');
