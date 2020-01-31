import { action } from './helpers';
import { find } from './find';

/**
 * Converges on an element first existing in the DOM, then selects a
 * matching option based on the text content, and triggers `change`
 * and `input` events for the select element.
 *
 * ``` html
 * <form ...>
 *   <select id="month">
 *     <option value="1">January</option>
 *     <option value="2">February</option>
 *     <option value="3">March</option>
 *     ...
 *   </select>
 *   ...
 * </form>
 * ```
 *
 * ``` javascript
 * await new Interactor('select').select('February');
 * await new Interactor('form').fill('select#month', 'March');
 * ```
 *
 * For multiple selects you can pass an array of options you would
 * like to select.
 *
 * ``` html
 * <form ...>
 *   <select id="month" multiple>
 *     <option value="1">January</option>
 *     <option value="2">February</option>
 *     <option value="3">March</option>
 *     ...
 *   </select>
 *   ...
 * </form>
 * ```
 *
 * ``` javascript
 * await new Interactor('select').select(['February', 'March']);
 * await new Interactor('form').select('select#month', ['February', 'March']);
 * ```
 *
 * @method Interactor#select
 * @param {String} [selector] - Nested element query selector
 * @param {String|String[]} options - Option or array of options text to select
 * @returns {Interactor} A new instance with additional convergences
 */
export function select(selectorOrOption, options) {
  let selector;

  // if option is not defined, it is assumed that the only passed
  // argument is the option for the root element
  if (typeof options === 'undefined') {
    options = selectorOrOption;
  } else {
    selector = selectorOrOption;
  }

  // turn options into an array
  options = [].concat(options);

  return find
    .call(this, selector)
    .when($select => {
      if (!$select.multiple && options.length > 1) {
        throw new Error(`unable to select more than one option for "${selector}"`);
      }

      // find the option by text content
      return [
        $select,
        options.map(option => {
          for (let $option of $select.options) {
            if ($option.text === option) {
              return $option;
            }
          }

          throw new Error(`unable to find option "${option}"`);
        })
      ];
    })
    .do(([$select, $options]) => {
      if ($select.multiple) {
        $options.forEach(option => {
          // since multiple selects can toggle selection, we'll toggle
          // the option to the opposite of what it is now
          option.selected = !option.selected;
        });
      } else {
        // select the option
        $options[0].selected = true;
      }

      // dispatch input event
      $select.dispatchEvent(
        new Event('input', {
          bubbles: true,
          cancelable: true
        })
      );

      // dispatch change event
      $select.dispatchEvent(
        new Event('change', {
          bubbles: true,
          cancelable: true
        })
      );
    });
}

/**
 * Interaction creator for selecting an option of a specific select
 * element within a custom interactor class.
 *
 * ``` html
 * <form ...>
 *   <select id="month">
 *     <option value="1">January</option>
 *     <option value="2">February</option>
 *     <option value="3">March</option>
 *     ...
 *   </select>
 *   ...
 * </form>
 * ```
 *
 * ``` javascript
 * \@interactor class FormInteractor {
 *   selectMonth = selectable('select#month');
 * }
 * ```
 *
 * ``` javascript
 * await new FormInteractor('form').selectMonth('February');
 * ```
 *
 * For multiple selects you can pass an array of options you would
 * like to select.
 *
 * ``` html
 * <form ...>
 *   <select id="month" multiple>
 *     <option value="1">January</option>
 *     <option value="2">February</option>
 *     <option value="3">March</option>
 *     ...
 *   </select>
 *   ...
 * </form>
 * ```
 *
 * ``` javascript
 * \@interactor class FormInteractor {
 *   selectMonth = selectable('select#month');
 * }
 * ```
 *
 * ``` javascript
 * await new FormInteractor('form').selectMonth(['February', 'March']);
 * ```
 *
 * @function selectable
 * @param {String} selector - Element query selector
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return action(function(option) {
    return select.call(this, selector, option);
  });
}
