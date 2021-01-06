import { createInteractor, perform, focused, focus, blur } from '../index';
import { isVisible } from 'element-is-visible';
import { dispatchChange, dispatchInput } from '../dispatch';
import { getSelect } from '../get-select';

const MultiSelectOption = createInteractor<HTMLOptionElement>('option')({
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

const MultiSelectInteractor = createInteractor<HTMLSelectElement>('select box')({
  selector: 'select[multiple]',
  locator: (element) => element.labels ? (Array.from(element.labels)[0]?.textContent || '') : '',
  filters: {
    title: (element) => element.title,
    id: (element) => element.id,
    valid: (element) => element.validity.valid,
    values: (element) => Array.from(element.selectedOptions).map((o) => o.label),
    visible: { apply: isVisible, default: true },
    disabled: {
      apply: (element) => element.disabled,
      default: false
    },
    focused
  },
  actions: {
    click: perform((element) => { element.click() }),
    focus,
    blur,
    choose: async (interactor, text: string) => {
      await interactor.find(MultiSelectOption(text)).choose();
    },
    select: async (interactor, text: string) => {
      await interactor.find(MultiSelectOption(text)).select();
    },
    deselect: async (interactor, text: string) => {
      await interactor.find(MultiSelectOption(text)).deselect();
    },
  },
});

/**
 * Call this {@link InteractorConstructor} to initialize an {@link Interactor}
 * for select boxes with multiple select. The multi select interactor can be
 * used to interact with select boxes with the `multiple` attribute and to
 * assert on their state.
 *
 * See {@link Select} for an interactor for single select boxes.
 *
 * The multi select is located by the text of its label.
 *
 * ### Example
 *
 * ``` typescript
 * await MultiSelect('Language').select('English');
 * await MultiSelect('Language').select('German');
 * await MultiSelect('Language').deselect('Swedish');
 * await MultiSelect('Language').has({ values: ['English', 'German'] });
 * ```
 *
 * ### Filters
 *
 * - `title`: *string* – Filter by title
 * - `id`: *string* – Filter by id
 * - `valid`: *boolean* – Filter by whether the checkbox is valid.
 * - `values`: *string[]* – Filter by the text of the selected options.
 * - `visible`: *boolean* – Filter by visibility. Defaults to `true`. See {@link isVisible}.
 * - `disabled`: *boolean* – Filter by whether the checkbox is disabled. Defaults to `false`.
 * - `focused`: *boolean* – Filter by whether the checkbox is focused. See {@link focused}.
 *
 * ### Actions
 *
 * - `click()`: *{@link Interaction}* – Click on the multi select
 * - `focus()`: *{@link Interaction}* – Move focus to the multi select
 * - `blur()`: *{@link Interaction}* – Move focus away from the multi select
 * - `choose(text: string)`: *{@link Interaction}* – Choose the option with the given text from the multi select. Will deselect all other selected options.
 * - `select(text: string)`: *{@link Interaction}* – Add the option with the given text to the selection.
 * - `deselect(text: string)`: *{@link Interaction}* – Remove the option with the given text from the selection.
 *
 * @category Interactor
 */
export const MultiSelect = MultiSelectInteractor;
