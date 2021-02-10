/* eslint-disable @typescript-eslint/no-explicit-any */

import { Interactor } from './specification';

/**
 * Helper function for focused filters, returns whether the given element is focused.
 */
export function focused(element: Element): boolean {
  console.warn("usage of the focused() helper is deprecated, and will be removed from the public API. Instead, switch your interactor to extend the `HTML` interactor to inherit the `focused` filter");
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
export async function focus<E extends HTMLElement>(interactor: Interactor<E, any>): Promise<void> {
  console.warn("usage of the focus() helper is deprecated, and will be removed from the public API. Instead, switch your interactor to extend the `HTML` interactor to inherit the `focus()` action");
  await interactor.perform((element) => element.focus())
};

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
export async function blur<E extends HTMLElement>(interactor: Interactor<E, any>): Promise<void> {
  console.warn("usage of the blur() helper is deprecated, and will be removed from the public API. Instead, switch your interactor to extend the `HTML` interactor to inherit the `blur()` action");
  await interactor.perform((element) => element.blur())
};
