import { when } from '~/when';
import { throwIfEmpty } from '~/util';

type Query<R> = (locator: string, container: Element) => Iterable<R> | Promise<Iterable<R>>;

export type Selector<R> = (locator: string, container: Element) => Promise<R[]>;

export function selector<R>(query: Query<R>): Selector<R> {
  return (locator, container) =>
    when(async () =>
      throwIfEmpty(
        Array.from(await query(locator, container)),
        `Did not find any matches with locator "${locator}"`
      )
    );
}
