import { createInteractor, perform } from '../src/index';

const Link = createInteractor<HTMLLinkElement>('link')({
  selector: 'a',
  actions: {
    click: perform(element => { element.click() }),
    setHref: perform((element, value: string) => { element.href = value })
  }
});

const Div = createInteractor('div')({
  locator: (element) => element.id || "",
});

// cannot pass invalid options
// $ExpectError
createInteractor<HTMLLinkElement>('whatever')({ foo: "bar" });

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
