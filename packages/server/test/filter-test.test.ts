import { describe, it } from 'mocha';
import * as expect from 'expect';
import * as path from 'path';

import { Test } from '@bigtest/suite';
import { filterTest } from '../src/filter-test';


describe('filter test', () => {
  describe('with files', () => {
    let test: Test = {
      description: 'some test',
      steps: [],
      assertions: [],
      children: [
        { description: 'child one', path: './foo.ts', steps: [], assertions: [], children: [] },
        { description: 'child two', path: './bar.ts', steps: [], assertions: [], children: [] },
        { description: 'child three', path: './baz.ts', steps: [], assertions: [], children: [] },
      ]
    }

    it('returns all children when list of files is empty', async () => {
      let filtered = filterTest(test, { files: [] });
      expect(filtered.children.length).toEqual(3)
    });

    it('filters list of files by normalized file name', async () => {
      let filtered = filterTest(test, { files: ['foo.ts', path.resolve('bar.ts')] });
      expect(filtered.children.length).toEqual(2)
      expect(filtered.children.map((c) => c.description)).toEqual(['child one', 'child two']);
    });

    it('throws an error if the given file does not exist', async () => {
      expect(() => {
        filterTest(test, { files: ['does-not-exist.ts'] });
      }).toThrowError(`file with path '${path.resolve('does-not-exist.ts')}' does not exist`);
    });

    it('throws an error if the given file exists but is not part of the test', async () => {
      expect(() => {
        filterTest(test, { files: ['src/index.ts'] });
      }).toThrowError(`file with path '${path.resolve('src/index.ts')}' exists, but is not part of your test files`);
    });
  });
});
