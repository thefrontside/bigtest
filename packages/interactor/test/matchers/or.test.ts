import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from '../helpers';

import { HTML, or, including } from '../../src/index';

describe('@interactors/html', () => {
  describe('or', () => {
    it('can check whether the given value matches any of the given matchers', async () => {
      dom(`
        <div title="hello cruel world"></div>
      `);

      await HTML({ title: or(including('world'), including('hello')) }).exists();
      await HTML({ title: or(including('world'), including('blah')) }).exists();
      await expect(HTML({ title: or(including('blah'), including('monkey')) }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
    });

    it('can check whether the given value matches any of the given actual values', async () => {
      dom(`
        <div title="hello"></div>
      `);

      await HTML({ title: or('hello', 'world') }).exists();
      await expect(HTML({ title: or('blah', 'monkey') }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
    });
  });
});
