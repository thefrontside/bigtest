import { Match } from './match';
import { Interactor } from './interactor';
import { NoSuchElementError, AmbiguousElementError, NotAbsentError } from './errors';
import { formatTable } from './format-table';

const defaultSelector = 'div';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findMatches(parentElement: Element, interactor: Interactor<any, any, any>): Match<Element, any, any>[] {
  let elements = Array.from(parentElement.querySelectorAll(interactor.specification.selector || defaultSelector));
  return elements.map((e) => new Match(e, interactor.filter, interactor.locator));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findMatchesMatching(parentElement: Element, interactor: Interactor<any, any, any>): Match<Element, any, any>[] {
  return findMatches(parentElement, interactor).filter((m) => m.matches);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findMatchesNonEmpty(parentElement: Element, interactor: Interactor<any, any, any>): Match<Element, any, any>[] {
  let matches = findMatches(parentElement, interactor);
  let matching = matches.filter((m) => m.matches);
  if(matching.length > 0) {
    return matching;
  } else if(matches.length === 0) {
    throw new NoSuchElementError(`did not find ${interactor.description}`);
  } else {
    let table = formatTable({
      headers: interactor.locator ? [interactor.name, ...interactor.filter.asTableHeader()] : interactor.filter.asTableHeader(),
      rows: matches.slice().sort((a, b) => b.sortWeight - a.sortWeight).map((m) => m.asTableRow()),
    });
    throw new NoSuchElementError(`did not find ${interactor.description}, did you mean one of:\n\n${table}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolveUnique(parentElement: Element, interactor: Interactor<any, any, any>): Element {
  let matching = findMatchesNonEmpty(parentElement, interactor);

  if(matching.length === 1) {
    return matching[0].element;
  } else {
    let alternatives = matching.map((m) => '- ' + m.elementDescription());
    throw new AmbiguousElementError(`${interactor.description} matches multiple elements:\n\n${alternatives.join('\n')}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolveNonEmpty(parentElement: Element, interactor: Interactor<any, any, any>): Element[] {
  return findMatchesNonEmpty(parentElement, interactor).map(m => m.element);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolveEmpty(parentElement: Element, interactor: Interactor<any, any, any>): void {
  let matching = findMatchesMatching(parentElement, interactor);

  if(matching.length !== 0) {
    let alternatives = matching.map((m) => '- ' + m.elementDescription());
    throw new NotAbsentError(`${interactor.description} exists but should not:\n\n${alternatives.join('\n')}`);
  }
}
