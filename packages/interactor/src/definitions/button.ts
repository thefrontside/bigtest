import { createInteractor, perform, focused } from '../index';
import { isVisible } from 'element-is-visible';

function isButtonElement(element: HTMLInputElement | HTMLButtonElement): element is HTMLButtonElement {
  return element.tagName === 'BUTTON';
}

export const Button = createInteractor<HTMLInputElement | HTMLButtonElement>('button')({
  selector: 'button,input[type=button],input[type=submit],input[type=reset],input[type=image]',
  locator(element) {
    if(isButtonElement(element)) {
      return element.textContent || '';
    } else if(element.type === 'image') {
      return element.alt;
    } else {
      return element.value;
    }
  },
  filters: {
    title: (element) => element.title,
    id: (element) => element.id,
    visible: { apply: isVisible, default: true },
    disabled: {
      apply: (element) => element.disabled,
      default: false
    },
    focused
  },
  actions: {
    click: perform((element) => { element.click(); }),
    focus: perform((element) => { element.focus(); }),
    blur: perform((element) => { element.blur(); }),
  },
});
