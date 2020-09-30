
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
    element.value = ""
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
      element.value += letter;
      // input is not dispatched if the keydown event was stopped
      element.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: false, inputType: 'insertText', data: letter }));
    }
    // keyup is always dispatched
    element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: letter, code: guessCode(letter) }));
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
