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
  describe('all cases specified', () => {
    let matcher = (evt: WatcherEvent) =>  match<WatcherEvent>('code')({
      START: () => ({ type: "START" } as const),
      ERROR: ({ error }) => ({ type: "ERROR", error } as const),
      BUNDLE_END: ({ duration, result }) => ({
        type: "UPDATE",
        duration,
        result
      } as const)
    })(evt);
  
    it('matches without arguments', () => {
      let result = matcher({ code: 'START' });
  
      expect(result.type).toBe('START');
    });
  
    it('should get non tag props', () => {
      let result = matcher({ code: 'ERROR', error: new Error('foo') });
  
      expect(result.type === 'ERROR' && result.error.message === 'foo').toBe(true);
    });
  });

  describe('some cases', () => {
    let matcher = (msg: BundlerMessage) => match<BundlerMessage>('type')({
      START: () => ({ kind: "ONE", a: 1  } as const),
      ERROR: () => ({ kind: 'TWO' } as const),
    })(msg);

    it('can select from partial cases', () => {
      let result = matcher({  type: 'START' });

      expect(result.kind === 'ONE' && result.a === 1).toBe(true);
    })
  })
})
