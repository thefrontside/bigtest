import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from '../helpers';

import { MultiSelect, every, including } from '../../src/index';

describe('@interactors/html', () => {
  describe('every', () => {
    it('can check whether the given string is contained in an array', async () => {
      dom(`
        <select id="colors" multiple>
          <option selected>Neon Blue</option>
          <option selected>Neon Green</option>
        </select>
      `);

      await MultiSelect({ id: 'colors' }).has({ values: every(including('Neon')) });
      await expect(MultiSelect({ id: 'colors' }).has({ values: every(including('Blue')) })).rejects.toHaveProperty('name', 'FilterNotMatchingError')
    });
  });
});
