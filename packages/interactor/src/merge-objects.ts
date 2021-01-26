// A utility type for merging two object types
export type MergeObjects<A, B> = B & Omit<A, keyof B>;
