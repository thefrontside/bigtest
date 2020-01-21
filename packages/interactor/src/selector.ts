import { when } from '~/when';
import { throwIfEmpty } from '~/util';

type Query<T extends Element, R extends Element> = (container: T, locator: string) => Iterable<R>;

type Selector<T extends Element, R extends Element> = (container: T, locator: string) => Promise<R[]>;

export function selector<T extends Element, R extends Element>(query: Query<T, R>): Selector<T, R> {
  return (container, locator) =>
    when(() =>
      throwIfEmpty(
        Array.from(query(container, locator)),
        `Did not find any matches with locator "${locator}"`
      )
    );
}
