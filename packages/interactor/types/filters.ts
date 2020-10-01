import { createInteractor, perform } from '../src/index';

const TextField = createInteractor<HTMLInputElement>('text field')({
  selector: 'input',
  locator: (element) => element.id,
  filters: {
    enabled: {
      apply: (element) => !element.disabled,
      default: true
    },
    value: (element) => element.value
  },
  actions: {
    fillIn: perform((element, value: string) => { element.value = value })
  }
});

const Div = createInteractor('div')({
  locator: (element) => element.id || "",
});

TextField('foo', { enabled: true, value: 'thing' });

TextField('foo', { enabled: false });

TextField('foo').has({ value: 'thing' });
TextField('foo').is({ enabled: true });

// cannot use wrong type of filter

// $ExpectError
TextField('foo', { enabled: 'thing' });
// $ExpectError
TextField('foo', { value: true });
// $ExpectError
TextField('foo', { value: 123 });

// cannot use filter which doesn't exist

// $ExpectError
TextField('foo', { blah: 'thing' });

// $ExpectError
TextField({ blah: 'thing' });

// cannot use wrong type of filter with is

// $ExpectError
TextField('foo').is({ enabled: 'thing' });
// $ExpectError
TextField('foo').is({ value: true });
// $ExpectError
TextField('foo').is({ value: 123 });

// cannot use filter which doesn't exist with is

// $ExpectError
TextField('foo').is({ blah: 'thing' });

// cannot use wrong type of filter with has

// $ExpectError
TextField('foo').has({ enabled: 'thing' });
// $ExpectError
TextField('foo').has({ value: true });
// $ExpectError
TextField('foo').has({ value: 123 });

// cannot use filter which doesn't exist with has

// $ExpectError
TextField('foo').has({ blah: 'thing' });

// cannot use filter on interactor which has no filters
// $ExpectError
Div('foo').has({ blah: 'thing' });
