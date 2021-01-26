import { createInteractor } from '../src/index';

const HTML = createInteractor<HTMLElement>('html')({
  filters: {
    id: (element) => element.id,
  }
});

// cannot pass supertype
// $ExpectError
HTML.extend<Element>('foo');

// cannot pass other random type
// $ExpectError
HTML.extend<number>('div')

// without type parameter
HTML.extend('div')
  .filters({
    id: (element) => {
      // $ExpectType HTMLElement
      element;
      return element.id;
    }
  });

// with type parameter
HTML.extend<HTMLLinkElement>('link')
  .filters({
    href: (element) => {
      // $ExpectType HTMLLinkElement
      element;
      return element.href;
    }
  });
