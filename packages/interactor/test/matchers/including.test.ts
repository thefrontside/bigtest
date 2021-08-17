import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from '../helpers';

import { HTML, including } from '../../src/index';

describe('@interactors/html', () => {
  describe('including', () => {
    it('can check whether the given string is contained', async () => {
      dom(`
        <div title="hello world"></div>
      `);

      await HTML({ title: including('hello') }).exists();
      await HTML({ title: including('world') }).exists();
      await expect(HTML({ title: including('blah') }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
    });
  });
});
