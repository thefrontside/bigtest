import { createInteractor } from '../src/index';

const Link = createInteractor<HTMLLinkElement>('link')({
  selector: 'a',
  defaultLocator: ['byHref', 'byTitle'],
  locators: {
    byHref: (element) => element.href,
    byTitle: (element) => element.title
  }
});

Link('foobar');

Link.byHref('foobar');

// cannot use wrong type argument on locator
// $ExpectError
Link.byHref(123);

// cannot use locator which is not defined
// $ExpectError
Link.byValue('foobar');

const Button = createInteractor<HTMLButtonElement>('button')({
  selector: 'button',
  defaultLocator: 'byText',
  locators: {
    byText: (element) => element.textContent || ""
  }
});

Button('foobar');

const TextField = createInteractor<HTMLInputElement>('text field')({
  selector: 'input[type="text"]',
  // $ExpectError
  defaultLocator: 'byLabel',
  locators: {
    byPlaceholder: (element) => element.placeholder
  }
});

TextField('foobar');