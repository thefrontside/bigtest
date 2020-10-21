import { createInteractor, perform, focused } from '../index';
import { isVisible } from 'element-is-visible';

export const CheckBox = createInteractor<HTMLInputElement>('check box')({
  selector: 'input[type=checkbox]',
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
    check: perform((element) => { if(!element.checked) element.click(); }),
    uncheck: perform((element) => { if(element.checked) element.click(); }),
    toggle: perform((element) => { element.click(); }),
  },
});
