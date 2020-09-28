import { createInteractor, perform } from '../index';

function isButtonElement(element: HTMLInputElement | HTMLButtonElement): element is HTMLButtonElement {
  return element.tagName === 'BUTTON';
}

export const Button = createInteractor<HTMLInputElement | HTMLButtonElement>('button')({
  selector: 'button,input[type=button],input[type=submit],input[type=reset],input[type=image]',
  defaultLocator(element) {
    if(isButtonElement(element)) {
      return element.textContent || '';
    } else if(element.type === 'image') {
      return element.alt;
    } else {
      return element.value;
    }
  },
  locators: {
    byId: (element) => element.id,
    byTitle: (element) => element.title,
  },
  filters: {
    title: (element) => element.title,
    id: (element) => element.id,
    disabled: {
      apply: (element) => element.disabled,
      default: false
    }
  },
  actions: {
    click: perform((element) => { element.click(); }),
    focus: perform((element) => { element.focus(); }),
    blur: perform((element) => { element.blur(); }),
  },
});
