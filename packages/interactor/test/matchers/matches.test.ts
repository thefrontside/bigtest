import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from '../helpers';

import { HTML, matches } from '../../src/index';

describe('@bigtest/interactor', () => {
  describe('matches', () => {
    it('can provide description', () => {
      expect(matches(/hello/).format()).toEqual('matches /hello/');
    });

    it('can check whether the given string matches', async () => {
      dom(`
        <div title="hello world"></div>
        <div title="what the heck"></div>
      `);

      await HTML({ title: matches(/he(llo|ck)/) }).exists();
      await expect(HTML({ title: matches(/blah/) }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
    });
  });
});
