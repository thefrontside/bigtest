# @bigtest/matcher

> Switches bring no riches.

In typescript, [Algebraic Data Types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions) are encoded using union types with a discriminator field.

Example:

```ts
export type BundlerState =
  | { type: 'UNBUNDLED' }
  | { type: 'BUILDING'; warnings: BundlerWarning[] }
  | { type: 'GREEN'; path: string;  warnings: BundlerWarning[] }
  | { type: 'ERRORED'; error: BundlerError }
```

Pattern matching is a common usecase when dealing with ADTs. You'll often find yourself in a position where you need to default to certain values depending on what the underlying value is.

## Switches

```ts
switch (event.code) {
  case 'START':
    return { type: 'START' } as const;
  case 'END':
    return { type: 'UPDATE' } as const;
  case 'ERROR':
    return { type: 'ERROR', error: event.error } as const;
  default:
    throw new Error(`unexpect event ${event.code}`);
}
```


## Riches

```ts
match('code')<RollupWatcherEvent, BundlerMessage>({
  START: () => ({ type: 'START' }) as const,
  END: () => ({ type: 'UPDATE' } as const),
  ERROR: ({ error }) => ({ type: 'ERROR', error } as const),
})(event)
```