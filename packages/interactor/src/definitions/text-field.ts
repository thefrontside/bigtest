import { fillIn } from '../index';
import { FormField } from './form-field';

const selector = 'textarea, input' + [
  'button', 'checkbox', 'color', 'date', 'datetime-local', 'file', 'hidden',
  'image', 'month', 'radio', 'range', 'reset', 'submit', 'time', 'datetime'
].map((t) => `:not([type=${t}])`).join('');

const TextFieldInteractor = FormField.extend<HTMLInputElement | HTMLTextAreaElement>('text field')
  .selector(selector)
  .filters({
    value: (element) => element.value,
    placeholder: (element) => element.placeholder,
  })
  .actions({
    fillIn: ({ perform }, value: string) => perform((element) => fillIn(element, value)),
  })

/**
 * Call this {@link InteractorConstructor} to initialize a text field {@link
 * Interactor}.  The text field interactor can be used to interact with text
 * fields on the page and to assert on their state. A text field is any input
 * tag with a text-like interface, so input fields with e.g. `email` or `number`
 * types are also considered text fields, as is any input field with an unknown
 * type.
 *
 * The text fied is located by the text of its label.
 *
 * ### Example
 *
 * ``` typescript
 * await TextField('Email').fillIn('jonas@example.com');
 * await TextField('Email').has({ value: 'jonas@example.com' });
 * await TextField({ id: 'email-field', disabled: true }).exists();
 * ```
 *
 * ### Filters
 *
 * - `title`: *string* – Filter by title
 * - `id`: *string* – Filter by id
 * - `visible`: *boolean* – Filter by visibility. Defaults to `true`. See {@link isVisible}.
 * - `value`: *string* – Filter by the text field's current value.
 * - `placeholder`: *string* – Filter by the text field's placeholder attribute.
 * - `valid`: *boolean* – Filter by whether the text field is valid.
 * - `disabled`: *boolean* – Filter by whether the text field is disabled. Defaults to `false`.
 * - `focused`: *boolean* – Filter by whether the text field is focused. See {@link focused}.
 *
 * ### Actions
 *
 * - `click()`: *{@link Interaction}* – Click on the text field
 * - `focus()`: *{@link Interaction}* – Move focus to the text field
 * - `blur()`: *{@link Interaction}* – Move focus away from the text field
 * - `fillIn(value: string)`: *{@link Interaction}* – Fill in the text field with the given value. See {@link fillIn}.
 *
 * @category Interactor
 */
export const TextField = TextFieldInteractor;
