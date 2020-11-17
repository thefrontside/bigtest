import { Interaction, InteractorConstructor, createInteractor, perform, focused } from '../index';
import { isVisible } from 'element-is-visible';
import { FilterParams, ActionMethods } from '../specification';

const filters = {
  title: (element: HTMLInputElement) => element.title,
  id: (element: HTMLInputElement) => element.id,
  valid: (element: HTMLInputElement) => element.validity.valid,
  checked: (element: HTMLInputElement) => element.checked,
  visible: {
    apply: (element: HTMLInputElement) => isVisible(element) || (element.labels && Array.from(element.labels).some(isVisible)),
    default: true
  },
  disabled: {
    apply: (element: HTMLInputElement) => element.disabled,
    default: false
  },
  focused
};

const actions = {
  click: perform((element: HTMLInputElement) => { element.click(); }),
  check: perform((element: HTMLInputElement) => { if(!element.checked) element.click(); }),
  uncheck: perform((element: HTMLInputElement) => { if(element.checked) element.click(); }),
  toggle: perform((element: HTMLInputElement) => { element.click(); }),
};

type CheckboxConstructor = InteractorConstructor<HTMLInputElement, typeof filters, typeof actions>;

export interface CheckboxFilters extends FilterParams<HTMLInputElement, typeof filters> {
  /**
   * Filter by title
   */
  title?: string;
  /**
   * Filter by id
   */
  id?: string;
  /**
   * Filter by visibility. See {@link isVisible}.
   */
  valid?: boolean;
  /**
   * Filter by whether the checkbox is valid.
   */
  checked?: boolean;
  /**
   * Filter by whether the checkbox is checked.
   */
  visible?: boolean;
  /**
   * Filter by whether the checkbox is disabled.
   */
  disabled?: boolean;
  /**
   * Filter by whether the checkbox is focused.
   */
  focused?: boolean;
}

export interface CheckboxActions extends ActionMethods<HTMLInputElement, typeof actions> {
  /**
   * Click on the checkbox
   */
  click(): Interaction<void>;
  /**
   * Check the checkbox if it is not checked
   */
  check(): Interaction<void>;
  /**
   * Uncheck the checkbox if it is checked
   */
  uncheck(): Interaction<void>;
  /**
   * Toggle the checkbox
   */
  toggle(): Interaction<void>;
}

/**
 * Call this {@link InteractorConstructor} to initialize a checkbox interactor.
 * The checkbox interactor can be used to interact with checkboxes on the page and
 * to assert on their state.
 *
 * The checkbox is located by the text of its label.
 *
 * ### Example
 *
 * ``` typescript
 * await Checbox('Submit').click();
 * await Checbox('Submit').is({ disabled: true });
 * await Checbox({ id: 'submit-button', disabled: true }).exists();
 * ```
 *
 * ### See also
 *
 * - {@link ButtonFilters}: filters defined for this interactor
 * - {@link ButtonActions}: actions callable on instances of this interactor
 * - {@link InteractorConstructor}: how to create an interactor instance from this constructor
 * - {@link Interactor}: interface of instances of this interactor in addition to its actions
 *
 * @category Interactor
 */
export const CheckBox: CheckboxConstructor = createInteractor<HTMLInputElement>('check box')({
  selector: 'input[type=checkbox]',
  locator: (element) => element.labels ? (Array.from(element.labels)[0]?.textContent || '') : '',
  filters,
  actions,
});
