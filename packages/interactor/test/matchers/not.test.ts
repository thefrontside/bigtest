import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from '../helpers';

import { HTML, not, including } from '../../src/index';


const div = HTML({ id: "test-div" });

describe('@bigtest/interactor', () => {

  describe('not', () => {
    it('can check whether the filter does not match the given matcher', async () => {
      dom(`
        <div id="test-div" title="hello cruel world"></div>
      `);

      await div.has({ title: not(including("monkey")) });
      await expect(div.has({ title: not(including('world')) })).rejects.toHaveProperty('name', 'FilterNotMatchingError');
    });

    it('can check whether the filter does not match the given literal value', async () => {
      dom(`
        <div id="test-div" title="hello"></div>
      `);

      await div.has({ title: not('monkey') });
      await expect(div.has({ title: not('hello') })).rejects.toHaveProperty('name', 'FilterNotMatchingError');
    });
  });
});
