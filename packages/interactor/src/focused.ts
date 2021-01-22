/* eslint-disable @typescript-eslint/no-explicit-any */

import { Interactor } from './specification';

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
export async function focus<E extends HTMLElement>(interactor: Interactor<E, any>): Promise<void> {
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
  await interactor.perform((element) => element.blur())
};
