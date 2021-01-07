import { describe, it } from 'mocha';
import expect from 'expect';
import jest from 'jest-mock';
import { Context } from 'effection';
import { MainError } from '@effection/node';
import { Deferred } from '@bigtest/effection';
import { World } from './helpers';

import { warnUnexpectedExceptions } from '../src/warn-unexpected-exceptions';

describe('unexpected errors', () => {
  let suspense: Deferred<void>;
  let context: Context;
  let warn: jest.SpyInstance<void, string[]>;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    suspense = Deferred();
    context = World.spawn(function*() {
      try {
        return yield warnUnexpectedExceptions(function*(argv) {
          yield suspense.promise;
          return argv;
        })(['hello', 'world']);
      } catch (error) {}
    });
  });

  afterEach(() => {
    warn.mockRestore();
  });

  describe('when the process exits normally', () => {
    let result: string[];
    beforeEach(async () => {
      suspense.resolve();
      result = await context;
    });

    it('returns the result as expected', () => {
      expect(result).toEqual(['hello', 'world']);
    });

    it('does not warn anything', () => {
      expect(warn).not.toHaveBeenCalled();
    });
  });

  describe('when the process completes with an expected error', () => {
    beforeEach(async () => {
      suspense.reject(new MainError({ exitCode: 30 }));
      return await context;
    });

    it('does not print any warnings', () => {
      expect(warn).not.toHaveBeenCalled();
    });
  });

  describe('when the process completes with an unexpected error', () => {
    beforeEach(async () => {
      suspense.reject(new Error('boom!'));
      await context;
    });

    it('warns a biggie warning', () => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("UNEXPECTED ERROR"));
    });
  });

});
