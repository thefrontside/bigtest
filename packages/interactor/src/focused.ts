import { perform } from './perform';
import { ActionFn } from './specification';

/**
 * Helper function for focused filters, returns whether the given element is focused.
 */
export function focused(element: Element): boolean {
  return element.ownerDocument.activeElement === element;
}

export const focus: ActionFn<any> =
  perform(<T extends keyof HTMLElementTagNameMap>(element: HTMLElementTagNameMap[T]) => {
    element.focus();
});

export const blur: ActionFn<any> =
  perform(<T extends keyof HTMLElementTagNameMap>(element: HTMLElementTagNameMap[T]) => {
    element.blur();
});
