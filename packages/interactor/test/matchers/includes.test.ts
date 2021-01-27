import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from '../helpers';

import { HTML, includes } from '../../src/index';

describe('@bigtest/interactor', () => {
  describe('includes', () => {
    it('can provide description', () => {
      expect(includes('hello').format()).toEqual('includes "hello"');
    });

    it('can check whether the given string is contained', async () => {
      dom(`
        <div title="hello world"></div>
      `);

      await HTML({ title: includes('hello') }).exists();
      await HTML({ title: includes('world') }).exists();
      await expect(HTML({ title: includes('blah') }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
    });
  });
});
