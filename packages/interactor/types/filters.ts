import { createInteractor } from '../src/index';

const TextField = createInteractor<HTMLInputElement>('text field')({
  selector: 'input',
  defaultLocator: (element) => element.id,
  filters: {
    enabled: {
      apply: (element) => !element.disabled,
      default: true
    },
    value: (element) => element.value
  },
  actions: {
    fillIn: (element, value: string) => { element.value = value }
  }
});

TextField('foo', { enabled: true, value: 'thing' });

TextField('foo', { enabled: false });

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
