import { test } from '@bigtest/suite';
import { createInteractor, perform } from '../src/index';

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
    fillIn: perform((element, value: string) => { element.value = value })
  }
});

test("using interactors")
  .step(TextField("username").fillIn("cowboyd"))
  .step(TextField("password").fillIn("secret"))
  .assertion(TextField("username").exists())

test("bad interactor usage")
  // cannot use side-effect interactions in an assertion
  // $ExpectError
  .assertion(TextField("username").fillIn('cowboyd'))
