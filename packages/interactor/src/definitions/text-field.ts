import { createInteractor, perform, fillIn } from '../index';

export const TextField = createInteractor<HTMLInputElement>('text field')({
  selector: 'input:not([type]),input[type=text]',
  defaultLocator: (element) => element.labels ? (Array.from(element.labels)[0]?.textContent || '') : '',
  locators: {
    byId: (element) => element.id,
    byTitle: (element) => element.title,
    byPlaceholder: (element) => element.placeholder,
  },
  filters: {
    title: (element) => element.title,
    id: (element) => element.id,
    value: (element) => element.value,
    placeholder: (element) => element.placeholder,
    valid: (element) => element.validity.valid,
    disabled: {
      apply: (element) => element.disabled,
      default: false
    }
  },
  actions: {
    click: perform((element) => { element.click(); }),
    focus: perform((element) => { element.focus(); }),
    blur: perform((element) => { element.blur(); }),
    fillIn: perform(fillIn),
  },
});
