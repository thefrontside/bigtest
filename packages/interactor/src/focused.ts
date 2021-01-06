import { perform } from './perform';

/**
 * Helper function for focused filters, returns whether the given element is focused.
 */
export function focused(element: Element): boolean {
  return element.ownerDocument.activeElement === element;
}

/**
 * Helper function for focus action, performs `element.focus()` on the selected element.
 *
 * Can be used with object property value shorthand in your interactor actions.
 *
 * ```js
 * actions: {
 *   focus,
 * }
 * ```
 */
export const focus = perform(<E extends HTMLElement>(element: E) => {
    element.focus();
});

/**
 * Helper function for blur action, performs `element.blur()` on the selected element.
 *
 * Can be used with object property value shorthand in your interactor actions.
 *
 * ```js
 * actions: {
 *   focus,
 * }
 * ```
 */
export const blur = perform(<E extends HTMLElement>(element: E) => {
    element.blur();
});
