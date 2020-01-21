import { when } from '~/when';
import { throwIfEmpty } from '~/util';

type Query<R extends Element> = (container: Element, locator: string) => Iterable<R> | Promise<Iterable<R>>;

export type Selector<R extends Element> = (container: Element, locator: string) => Promise<R[]>;

export function selector<R extends Element>(query: Query<R>): Selector<R> {
  return (container, locator) =>
    when(async () =>
      throwIfEmpty(
        Array.from(await query(container, locator)),
        `Did not find any matches with locator "${locator}"`
      )
    );
}
