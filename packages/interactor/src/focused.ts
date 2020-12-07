import { perform } from './perform';

/**
 * Helper function for focused filters, returns whether the given element is focused.
 */
export function focused(element: Element): boolean {
  return element.ownerDocument.activeElement === element;
}

export const focus = perform(<E extends HTMLElement>(element: E) => {
    element.focus();
});

export const blur = perform(<E extends HTMLElement>(element: E) => {
    element.blur();
});
