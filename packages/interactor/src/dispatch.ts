
/** @internal */
export function dispatchChange(element: HTMLElement): boolean {
  let Event = element.ownerDocument.defaultView?.Event || window.Event;
  return element.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
}

/** @internal */
export function dispatchInput(element: HTMLElement, options: InputEventInit = {}): boolean {
  let InputEvent = element.ownerDocument.defaultView?.InputEvent || window.InputEvent;
  return element.dispatchEvent(new InputEvent('input', Object.assign({ bubbles: true, cancelable: false }, options)));
}

/** @internal */
export function dispatchKeyDown(element: HTMLElement, options: KeyboardEventInit = {}): boolean {
  let KeyboardEvent = element.ownerDocument.defaultView?.KeyboardEvent || window.KeyboardEvent;
  return element.dispatchEvent(new KeyboardEvent('keydown', Object.assign({ bubbles: true, cancelable: true }, options)));
}

/** @internal */
export function dispatchKeyUp(element: HTMLElement, options: KeyboardEventInit = {}): boolean {
  let KeyboardEvent = element.ownerDocument.defaultView?.KeyboardEvent || window.KeyboardEvent;
  return element.dispatchEvent(new KeyboardEvent('keyup', Object.assign({ bubbles: true, cancelable: true }, options)));
}
