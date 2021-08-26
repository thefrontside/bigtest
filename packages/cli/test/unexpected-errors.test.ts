import { describe, it, beforeEach, afterEach } from '@effection/mocha';
import expect from 'expect';
import jest from 'jest-mock';
import { run, Task, createFuture, MainError } from 'effection';

import { warnUnexpectedExceptions } from '../src/warn-unexpected-exceptions';

describe('unexpected errors', () => {
  let suspense: ReturnType<typeof createFuture>;
  let context: Task;
  let warn: jest.SpyInstance<void, string[]>;

  beforeEach(function*() {
    warn = jest.spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    suspense = createFuture<void>();
    context = run(function*() {
      try {
        return yield warnUnexpectedExceptions((argv) => function*() {
          yield suspense.future;
          return argv;
        })(['hello', 'world']);
      } catch (error) {}
    });
  });

  afterEach(function*() {
    warn.mockRestore();
  });

  describe('when the process exits normally', () => {
    let result: string[];
    beforeEach(function*() {
      suspense.produce({ state: 'completed', value: undefined });
      result = yield context;
    });

    it('returns the result as expected', function*() {
      expect(result).toEqual(['hello', 'world']);
    });

    it('does not warn anything', function*() {
      expect(warn).not.toHaveBeenCalled();
    });
  });

  describe('when the process completes with an expected error', () => {
    beforeEach(function*() {
      suspense.produce({ state: 'errored', error: new MainError({ exitCode: 30}) });
      return yield context;
    })

    it('does not print any warnings', function*() {
      expect(warn).not.toHaveBeenCalled();
    });
  });

  describe('when the process completes with an unexpected error', () => {
    beforeEach(function*() {
      suspense.produce({ state: 'errored', error: new Error('boom!') });
      yield context;
    });

    it('warns a biggie warning', function*() {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("UNEXPECTED ERROR"));
    });
  });

});
