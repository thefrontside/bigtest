/* 
* extract any extra properties other than the string tag
* e.g.
* Type A = { type: 'ERROR', error: Error }
* type N = NonTagType<A, 'code', 'Error'>;  { error: Error }
*/ 
type NonTagType<A, K extends keyof A, Type extends string> = Omit<
  Extract<A, Record<K, Type>>,
  K
>;

type Matcher<A, K extends keyof A, R = unknown> = {
  [P in Extract<A, { [k in K]: string }>[K]]: (v: NonTagType<A, K, P>) => R;
};

export const match = <A, R>(v: A) => <Tag extends keyof A>(tag: Tag) => (
  matcher: Matcher<A, Tag, R>
): ReturnType<Matcher<A, Tag, R>[keyof Matcher<A, Tag>]> extends infer R
  ? R
  : never => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (matcher as any)[v[tag]]();
};