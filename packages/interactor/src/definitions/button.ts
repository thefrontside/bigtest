import { Interaction, InteractorConstructor, createInteractor, perform, focused, isVisible } from '../index';
import { FilterParams, ActionMethods } from '../specification';

function isButtonElement(element: HTMLInputElement | HTMLButtonElement): element is HTMLButtonElement {
  return element.tagName === 'BUTTON';
}

type ButtonElement = HTMLInputElement | HTMLButtonElement;

const filters = {
  title: (element: ButtonElement) => element.title,
  id: (element: ButtonElement) => element.id,
  visible: { apply: isVisible, default: true },
  disabled: {
    apply: (element: ButtonElement) => element.disabled,
    default: false
  },
  focused
};

const actions = {
  click: perform((element: ButtonElement) => { element.click(); }),
  focus: perform((element: ButtonElement) => { element.focus(); }),
  blur: perform((element: ButtonElement) => { element.blur(); }),
};

type ButtonConstructor = InteractorConstructor<ButtonElement, typeof filters, typeof actions>;

export interface ButtonFilters extends FilterParams<ButtonElement, typeof filters> {
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
  visible?: boolean;
  /**
   * Filter by whether the button is disabled.
   */
  disabled?: boolean;
  /**
   * Filter by whether the button is focused.
   */
  focused?: boolean;
}

export interface ButtonActions extends ActionMethods<ButtonElement, typeof actions> {
  /**
   * Click on the button
   */
  click(): Interaction<void>;
  /**
   * Move focus to the button
   */
  focus(): Interaction<void>;
  /**
   * Move focus away from the button
   */
  blur(): Interaction<void>;
}

/**
 * Call this {@link InteractorConstructor} to initialize a button interactor.
 * The button interactor can be used to interact with buttons on the page and
 * to assert on their state.
 *
 * The button is located by the visible text on the button.
 *
 * ### Example
 *
 * ``` typescript
 * await Button('Submit').click();
 * await Button('Submit').is({ disabled: true });
 * await Button({ id: 'submit-button', disabled: true }).exists();
 * ```
 *
 * ### See also
 *
 * - {@link ButtonFilters}: filters defined for this interactor
 * - {@link ButtonActions}: actions callable on instances of this interactor
 * - {@link InteractorConstructor}: how to create an interactor instance from this constructor
 * - {@link Interactor}: interface of instances of this interactor in addition to its actions
 */
export const Button: ButtonConstructor = createInteractor<ButtonElement>('button')({
  selector: 'button,input[type=button],input[type=submit],input[type=reset],input[type=image]',
  locator(element) {
    if(isButtonElement(element)) {
      return element.textContent || '';
    } else if(element.type === 'image') {
      return element.alt;
    } else {
      return element.value;
    }
  },
  filters,
  actions,
});
