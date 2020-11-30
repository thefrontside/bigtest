import { match } from '../src/index';

type WatcherEvent =
  | { code: "START" }
  | {
      code: "BUNDLE_END";
      duration: number;
      result: "good" | "bad";
    }
  | { code: "ERROR"; error: Error };

type BundlerMessage =
  | { type: "START" }
  | { type: "UPDATE"; duration: number; result: "good" | "bad" }
  | { type: "ERROR"; error: Error };

let matchAll = match<WatcherEvent>('code')({
  START: () => ({ type: "START" } as const),
  ERROR: ({ error }) => ({ type: "ERROR", error } as const),
  BUNDLE_END: ({ duration, result }) => ({
    type: "UPDATE",
    duration,
    result
  } as const)
});

let matcherStart = matchAll({ code: 'START' } as const);

 matcherStart.type // $ExpectType "START"

// $ExpectError
matcherStart.type === 'UPDATE';

// does not incude fields from other elements of the union

// $ExpectError
matcherStart.error

// $ExpectError
matcherStart.duration

let matcherError = matchAll({ code: 'ERROR', error: new Error('fooo') } as const);

// type narrows on error field
matcherError.type // $ExpectType "ERROR"
matcherError.error.message // $ExpectType string


let matchPartial = match<BundlerMessage>('type')({
  START: () => ({ kind: "ONE", a: 1  } as const),
  ERROR: () => ({ kind: 'TWO' } as const),
});

let result = matchPartial({  type: 'START' });

// type narrow
result.a // $ExpectType 1
