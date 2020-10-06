import { Match } from './match';
import { Interactor } from './interactor';
import { NoSuchElementError, AmbiguousElementError } from './errors';
import { formatTable } from './format-table';

const defaultSelector = 'div';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolve(parentElement: Element, interactor: Interactor<any, any, any>) {
  let elements = Array.from(parentElement.querySelectorAll(interactor.specification.selector || defaultSelector));
  let matches = elements.map((e) => new Match(e, interactor.filter, interactor.locator));
  let matching = matches.filter((m) => m.matches);

  if(matching.length === 1) {
    return matching[0].element;
  } else if(matching.length > 1) {
    let alternatives = matching.map((m) => '- ' + m.elementDescription());
    throw new AmbiguousElementError(`${interactor.description} matches multiple elements:\n\n${alternatives.join('\n')}`);
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
