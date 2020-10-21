export function focused(element: Element): boolean {
  return element.ownerDocument.activeElement === element;
}
