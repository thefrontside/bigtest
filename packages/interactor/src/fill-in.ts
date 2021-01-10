import { dispatchChange, dispatchInput, dispatchKeyDown, dispatchKeyUp } from './dispatch';

type TextFieldElement = HTMLInputElement | HTMLTextAreaElement;

// do a best effort at determining the key code
function guessCode(letter: string): string | undefined {
  if(letter.match(/^[a-zA-Z]$/)) {
    return `Key${letter.toUpperCase()}`;
  } else if(letter.match(/^[0-9]$/)) {
    return `Digit${letter}`;
  }
}

function clearText(element: TextFieldElement) {
  if(element.value.length) {
    setValue(element, "");
    dispatchInput(element, { inputType: 'deleteContentBackward', data: null });
  }
}

function enterText(element: TextFieldElement, value: string) {
  for(let letter of value) {
    if(dispatchKeyDown(element, { key: letter, code: guessCode(letter) })) {
      // don't change the value if the keydown event was stopped
      setValue(element, element.value + letter);
      // input is not dispatched if the keydown event was stopped
      dispatchInput(element, { inputType: 'insertText', data: letter });
    }
    // keyup is always dispatched
    dispatchKeyUp(element, { key: letter, code: guessCode(letter) });
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
function setValue(element: TextFieldElement, value: string): void {
  let property = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value');
  if (property && property.set) {
    property.set.call(element, value);
  } else {
    // if the value property on the element protoype is not present
    // then there are worse problems. But this is very typesafe!
    element.value = value;
  }
}

/**
 * Fill in text into an element by emulating how a user would do it, first
 * focusing the element, then filling in the text letter by letter, generating
 * the appropriate keyboard events.
 *
 * @param element The element to fill in text in
 * @param value The text value to fill in
 */
export function fillIn(element: TextFieldElement, value: string): void {
  let originalValue = element.value;

  element.focus();

  clearText(element);
  enterText(element, value);

  if(originalValue !== value) {
    dispatchChange(element);
  }

  element.blur();
}
