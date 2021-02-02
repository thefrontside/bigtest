import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from '../helpers';

import { HTML, matching } from '../../src/index';

describe('@bigtest/interactor', () => {
  describe('matching', () => {
    it('can provide description', () => {
      expect(matching(/hello/).format()).toEqual('matching /hello/');
    });

    it('can check whether the given string matching', async () => {
      dom(`
        <div title="hello world"></div>
        <div title="what the heck"></div>
      `);

      await HTML({ title: matching(/he(llo|ck)/) }).exists();
      await expect(HTML({ title: matching(/blah/) }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
    });
  });
});
