import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from '../helpers';

import { MultiSelect, some, including } from '../../src/index';

describe('@interactors/html', () => {
  describe('some', () => {
    it('can check whether the given string is contained in an array', async () => {
      dom(`
        <select id="colors" multiple>
          <option selected>Red</option>
          <option selected>Blue</option>
          <option selected>Green</option>
          <option selected>Neon Blue</option>
          <option selected>Neon Green</option>
        </select>
      `);

      await MultiSelect({ id: 'colors' }).has({ values: some('Red') });
      await MultiSelect({ id: 'colors' }).has({ values: some(including('Neon')) });
      await expect(MultiSelect({ id: 'colors' }).has({ values: some('Yellow') })).rejects.toHaveProperty('name', 'FilterNotMatchingError')
    });
  });
});
