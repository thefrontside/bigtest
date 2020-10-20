export function getSelect(option: HTMLOptionElement): HTMLSelectElement {
  let select = option.closest('select');
  if(select) {
    return select;
  } else {
    throw new Error('option element is not in a select');
  }
}
