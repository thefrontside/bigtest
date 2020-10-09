
// do a best effort at determining the key code
function guessCode(letter: string): string | undefined {
  if(letter.match(/^[a-zA-Z]$/)) {
    return `Key${letter.toUpperCase()}`;
  } else if(letter.match(/^[0-9]$/)) {
    return `Digit${letter}`;
  }
}

function clearText(element: HTMLInputElement) {
  let InputEvent = element.ownerDocument.defaultView?.InputEvent || window.InputEvent;

  if(element.value.length) {
    setValue(element, "");
    element.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: false, inputType: 'deleteContentBackward', data: null }));
  }
}

function enterText(element: HTMLInputElement, value: string) {
  let InputEvent = element.ownerDocument.defaultView?.InputEvent || window.InputEvent;
  let KeyboardEvent = element.ownerDocument.defaultView?.KeyboardEvent || window.KeyboardEvent;

  for(let letter of value) {
    let keydownEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: letter, code: guessCode(letter) });
    if(element.dispatchEvent(keydownEvent)) {
      // don't change the value if the keydown event was stopped
      setValue(element, element.value + letter);
      // input is not dispatched if the keydown event was stopped
      element.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: false, inputType: 'insertText', data: letter }));
    }
    // keyup is always dispatched
    element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: letter, code: guessCode(letter) }));
  }
}


/**
 * Use the prototype setter of the element in order to set the value, that way any behavior that monkey patches
 * the element itself is circumvented. This has the effect of the value just "magically" appearing on the input
 * element just like it does when the browser sets the value because of the default action of an event.
 * We have to do this because React actually does do this monkey-patching as an optimization. Basically, they
 * short-circuit syncing the react state whenever someone sets input.value and then ignore the next `change` event.
 *
 * See https://github.com/cypress-io/cypress/issues/536
 */
function setValue(element: HTMLInputElement, value: string): void {
  let property = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value');
  if (property && property.set) {
    property.set.call(element, value);
  } else {
    // if the value property on the HTMLInputElement protoype is not present
    // then there are worse problems. But this is very typesafe!
    element.value = value;
  }
}

export function fillIn(element: HTMLInputElement, value: string) {
  let Event = element.ownerDocument.defaultView?.Event || window.Event;
  let originalValue = element.value;

  element.focus();

  clearText(element);
  enterText(element, value);

  if(originalValue !== value) {
    element.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
  }

  element.blur();
}
