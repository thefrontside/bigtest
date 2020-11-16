import { describe, it } from 'mocha';
import * as expect from 'expect'
import { match } from '../src';

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


describe("match", () => {
  let matcher = (evt: WatcherEvent) =>  match('code')<WatcherEvent, BundlerMessage>({
    START: () => ({ type: "START" }),
    ERROR: ({ error }) => ({ type: "ERROR", error }),
    BUNDLE_END: ({ duration, result }) => ({
      type: "UPDATE",
      duration,
      result
    })
  })(evt);

  it('matches without arguments', () => {
    let result = matcher({ code: 'START' });

    expect(result.type).toBe('START');
  });

  it('should get non tag props', () => {
    let result = matcher({ code: 'ERROR', error: new Error('foo') });

    expect(result.type === 'ERROR' && result.error.message === 'foo').toBe(true);
  });
})
