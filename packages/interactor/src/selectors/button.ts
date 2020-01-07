import { Selector } from '../common-types';

function isInput(elem: Element & { value?: any }): elem is HTMLInputElement {
  return typeof elem.value === 'string';
}

export function button(text: string): Selector<HTMLElement> {
  return container => {
    const buttons = Array.from(container.querySelectorAll('button')).filter(btn => btn.innerText === text);
    const inputs: Array<HTMLInputElement> = [
      ...container.querySelectorAll('input[type="submit"]'),
      ...container.querySelectorAll('input[type="reset"]'),
      ...container.querySelectorAll('input[type="button"]')
    ].filter(input => (isInput(input) ? input.value === text : false)) as any;

    return [...buttons, ...inputs];
  };
}
