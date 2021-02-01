import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from '../helpers';

import { HTML, not, including } from '../../src/index';

describe('@bigtest/interactor', () => {
  describe('not', () => {
    it('can provide description', () => {
      expect(not(including('bar')).format()).toEqual('not including "bar"');
      expect(not('bar').format()).toEqual('not "bar"');
    });

    it('can check whether the filter does not match the given matcher', async () => {
      dom(`
        <div title="hello cruel world"></div>
      `);

      await HTML({ title: not(including('monkey')) }).exists();
      await expect(HTML({ title: not(including('world')) }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
    });

    it('can check whether the filter does not match the given literal value', async () => {
      dom(`
        <div title="hello"></div>
      `);

      await HTML({ title: not('monkey') }).exists();
      await expect(HTML({ title: not('hello') }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
    });
  });
});
