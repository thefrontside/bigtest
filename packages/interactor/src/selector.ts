import { when } from '~/when';

interface IQueryContext<T extends Element> {
  container: T;
  locator: string;
}

interface ISelectorContext<T extends Element> {
  locator: string;
  containers: Array<T>;
}

interface ISelectorResult<T extends Element> {
  locator: string;
  matches: Array<T>;
}

type Query<T extends Element, R extends Element> = (context: IQueryContext<T>) => Iterable<R>;

type Selector<T extends Element, R extends Element> = (
  context: ISelectorContext<T>
) => Promise<ISelectorResult<R>>;

function flatten<T>(arrayOfArrays: Array<Array<T>>): T[] {
  return arrayOfArrays.reduce((memo, array) => memo.concat(array), []);
}

export function selector<T extends Element, R extends Element>(query: Query<T, R>): Selector<T, R> {
  return async ({ containers, locator }) => {
    const matches = flatten(
      await Promise.all(
        containers.map(async container => Array.from(await when(() => query({ container, locator }))))
      )
    );
    return { matches, locator };
  };
}
