import { createInteractor, perform, focused } from '../index';
import { isVisible } from 'element-is-visible';

export const RadioButton = createInteractor<HTMLInputElement>('radio button')({
  selector: 'input[type=radio]',
  locator: (element) => element.labels ? (Array.from(element.labels)[0]?.textContent || '') : '',
  filters: {
    title: (element) => element.title,
    id: (element) => element.id,
    valid: (element) => element.validity.valid,
    checked: (element) => element.checked,
    visible: {
      apply: (element) => isVisible(element) || (element.labels && Array.from(element.labels).some(isVisible)),
      default: true
    },
    disabled: {
      apply: (element) => element.disabled,
      default: false
    },
    focused
  },
  actions: {
    click: perform((element) => { element.click(); }),
    choose: perform((element) => { element.click(); }),
  },
});
