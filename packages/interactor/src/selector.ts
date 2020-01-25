import { when } from '~/when';
import { throwIfEmpty } from '~/util';

type Query<Container, Result> = (
  locator: string,
  container: Container
) => Iterable<Result> | Promise<Iterable<Result>>;

export type Selector<Container, Result> = (locator: string, container: Container) => Promise<Result[]>;

export function selector<Container, Result>(query: Query<Container, Result>): Selector<Container, Result> {
  return (locator, container) =>
    when(async () =>
      throwIfEmpty(
        Array.from(await query(locator, container)),
        `Did not find any matches with locator "${locator}"`
      )
    );
}
