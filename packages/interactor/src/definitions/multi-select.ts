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
    select: perform((element) => {
      let select = getSelect(element);

      if(!element.selected) {
        element.selected = true;
        dispatchChange(select);
        dispatchInput(select);
      }
    }),
    deselect: perform((element) => {
      let select = getSelect(element);

      if(element.selected) {
        element.selected = false;
        dispatchChange(select);
        dispatchInput(select);
      }
    }),
  },
});

export const MultiSelect = createInteractor<HTMLSelectElement>('select box')({
  selector: 'select[multiple]',
  locator: (element) => element.labels ? (Array.from(element.labels)[0]?.textContent || '') : '',
  filters: {
    title: (element) => element.title,
    id: (element) => element.id,
    valid: (element) => element.validity.valid,
    values: (element) => Array.from(element.selectedOptions).map((o) => o.label),
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
    select: async (interactor, value: string) => {
      await interactor.find(SelectOption(value)).select();
    },
    deselect: async (interactor, value: string) => {
      await interactor.find(SelectOption(value)).deselect();
    },
  },
});
