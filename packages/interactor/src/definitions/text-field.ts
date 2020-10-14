import { createInteractor, perform, fillIn } from '../index';
import { isVisible } from 'element-is-visible';

const selector = 'input' + [
  'button', 'checkbox', 'color', 'date', 'datetime-local', 'file', 'hidden',
  'image', 'month', 'radio', 'range', 'reset', 'submit', 'time', 'datetime'
].map((t) => `:not([type=${t}])`).join('');

export const TextField = createInteractor<HTMLInputElement>('text field')({
  selector,
  locator: (element) => element.labels ? (Array.from(element.labels)[0]?.textContent || '') : '',
  filters: {
    title: (element) => element.title,
    id: (element) => element.id,
    visible: { apply: isVisible, default: true },
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
