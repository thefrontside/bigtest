import { selector } from '~';
import { throwIfEmpty, compact } from '~/util';

export const button = selector<Element, HTMLButtonElement>((locator, container) =>
  Array.from(container.querySelectorAll('button')).filter(btn => btn.innerText === locator)
);

export const css = selector<Element, HTMLElement>((locator, container) =>
  container.querySelectorAll(locator)
);

export const inputByType = selector<Element, HTMLInputElement>((locator, container) =>
  container.querySelectorAll(`input[type="${locator}"]`)
);

export const input = selector<Element, HTMLInputElement>((locator, container) => {
  const labels = throwIfEmpty(
    Array.from(container.querySelectorAll('label')),
    'Did not find any `<label>` elements'
  );
  const matchedLabels = throwIfEmpty(
    labels.filter(label => label.innerText.trim() === locator),
    `Did not find any labels with text "${locator}"`
  );
  const inputs = throwIfEmpty(
    compact(matchedLabels.map(label => label.control)),
    `An \`<input>\` could not be found for all labels matching "${locator}"`
  );

  return inputs as HTMLInputElement[];
});
