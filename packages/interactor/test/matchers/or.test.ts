import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from '../helpers';

import { HTML, or, includes } from '../../src/index';

describe('@bigtest/interactor', () => {
  describe('or', () => {
    it('can provide description', () => {
      expect(or('foo', includes('bar')).format()).toEqual('"foo" or includes "bar"');
    });

    it('can check whether the given value matches any of the given matchers', async () => {
      dom(`
        <div title="hello cruel world"></div>
      `);

      await HTML({ title: or(includes('world'), includes('hello')) }).exists();
      await HTML({ title: or(includes('world'), includes('blah')) }).exists();
      await expect(HTML({ title: or(includes('blah'), includes('monkey')) }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
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
