import { createInteractor } from '../src/index';

const HTML = createInteractor<HTMLElement>('html')
  .filters({
    id: (element) => element.id,
  })
  .actions({
    click: (interactor) => interactor.perform((element) => element.click()),
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
  })
  .actions({
    setHref: (interactor, value: string) => interactor.perform((element) => {
      // $ExpectType HTMLLinkElement
      element;
      element.href = value;
    })
  });

// overriding filters and actions
const Thing = HTML.extend('thing')
  .filters({
    id: () => 4
  })
  .actions({
    click: async (interactor, value: number) => {
      interactor.perform((element) => {
        element.textContent = `Value: ${value}`;
      });
    }
  })

// uses overridden type for filter
Thing('thing', { id: 4 });

// cannot use original type for filter
// $ExpectError
Thing('thing', { id: 'thing' });

// uses overridden type for action
Thing('thing').click(5);

// cannot use original type for action
// $ExpectError
Thing('thing').click();
