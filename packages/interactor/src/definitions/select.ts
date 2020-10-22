import { createInteractor, perform } from '../index';
import { isVisible } from 'element-is-visible';
import { dispatchChange, dispatchInput } from '../dispatch';
import { getSelect } from '../get-select';

const SelectOption = createInteractor<HTMLOptionElement>('option')({
  selector: 'option',
  locator: (element) => element.label,
  filters: {
    disabled: {
      apply: (element) => element.disabled,
      default: false
    }
  },
  actions: {
    choose: perform((element) => {
      let select = getSelect(element);

      if(select.value !== element.value) {
        select.value = element.value;
        dispatchChange(select);
        dispatchInput(select);
      }
    }),
  },
});

export const Select = createInteractor<HTMLSelectElement>('select box')({
  selector: 'select:not([multiple])',
  locator: (element) => element.labels ? (Array.from(element.labels)[0]?.textContent || '') : '',
  filters: {
    title: (element) => element.title,
    id: (element) => element.id,
    valid: (element) => element.validity.valid,
    value: (element) => element.selectedOptions[0]?.label || '',
    visible: {
      apply: (element) => isVisible(element) || (element.labels && Array.from(element.labels).some(isVisible)),
      default: true
    },
    disabled: {
      apply: (element) => element.disabled,
      default: false
    }
  },
  actions: {
    click: perform((element) => { element.click(); }),
    focus: perform((element) => { element.focus(); }),
    blur: perform((element) => { element.blur(); }),
    choose: async (interactor, value: string) => {
      await interactor.find(SelectOption(value)).choose();
    },
  },
});
