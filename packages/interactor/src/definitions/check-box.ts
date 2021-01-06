import { createInteractor, perform, focused, focus, blur } from '../index';
import { isVisible } from 'element-is-visible';

const CheckBoxInteractor = createInteractor<HTMLInputElement>('check box')({
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
    click: perform((element) => { element.click() }),
    check: perform((element) => { if(!element.checked) element.click(); }),
    uncheck: perform((element) => { if(element.checked) element.click(); }),
    toggle: perform((element) => { element.click() }),
    focus,
    blur
  },
});

/**
 * Call this {@link InteractorConstructor} to initialize a checkbox {@link Interactor}.
 * The checkbox interactor can be used to interact with checkboxes on the page and
 * to assert on their state.
 *
 * The checkbox is located by the text of its label.
 *
 * ### Example
 *
 * ``` typescript
 * await CheckBox('Submit').click();
 * await CheckBox('Submit').is({ disabled: true });
 * await CheckBox({ id: 'submit-button', disabled: true }).exists();
 * ```
 *
 * ### Filters
 *
 * - `title`: *string* – Filter by title
 * - `id`: *string* – Filter by id
 * - `visible`: *boolean* – Filter by visibility. Defaults to `true`. See {@link isVisible}.
 * - `valid`: *boolean* – Filter by whether the checkbox is valid.
 * - `checked`: *boolean* – Filter by whether the checkbox is checked.
 * - `disabled`: *boolean* – Filter by whether the checkbox is disabled. Defaults to `false`.
 * - `focused`: *boolean* – Filter by whether the checkbox is focused. See {@link focused}.
 *
 * ### Actions
 *
 * - `click()`: *{@link Interaction}* – Click on the checkbox
 * - `focus()`: *{@link Interaction}* – Focus the checkbox
 * - `blur()`: *{@link Interaction}* – Blur the checkbox
 * - `check()`: *{@link Interaction}* – Check the checkbox if it is not checked
 * - `uncheck()`: *{@link Interaction}* – Uncheck the checkbox if it is checked
 * - `toggle()`: *{@link Interaction}* – Toggle the checkbox
 *
 * @category Interactor
 */
export const CheckBox = CheckBoxInteractor;
