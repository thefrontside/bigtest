/**
 * Helper function for focused filters, returns whether the given element is focused.
 * @category Helper
 */
export function focused(element: Element): boolean {
  return element.ownerDocument.activeElement === element;
}
