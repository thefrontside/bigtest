/* 
  * extract any extra properties other than the string tag
  * e.g.
  * Type A = { type: 'ERROR', error: Error }
  * type N = NonTagType<A, 'code', 'Error'>; // will extract the { error: Error } and omit { type: 'ERROR'}
*/ 
export type NonTagType<A, Tag extends keyof A, Type extends string> = Omit<
  Extract<A, Record<Tag, Type>>,
  Tag
>;

type Matchers<A extends { [k in Tag]: string }, Tag extends string, R> = {
  [K in A[Tag]]?: (v: NonTagType<A, Tag, K>) => R;
};

export const match = <Tag extends string>(tag: Tag) => <
  A extends { [k in Tag]: string},
  R
>(
  matcher: Matchers<A, Tag, R>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) =>(v: A): R => ((matcher as any)[v[tag]])(v);

