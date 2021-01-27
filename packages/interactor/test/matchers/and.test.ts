import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from '../helpers';

import { HTML, and, includes } from '../../src/index';

describe('@bigtest/interactor', () => {
  describe('and', () => {
    it('can provide description', () => {
      expect(and('foo', includes('bar')).format()).toEqual('"foo" and includes "bar"');
    });

    it('can check whether the given value matches all of the given matchers', async () => {
      dom(`
        <div title="hello cruel world"></div>
      `);

      await HTML({ title: and(includes('world'), includes('hello')) }).exists();
      await HTML({ title: and(includes('world'), includes('hello'), includes('cruel')) }).exists();
      await expect(HTML({ title: and(includes('world'), includes('monkey')) }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
      await expect(HTML({ title: and(includes('monkey'), includes('hello')) }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
    });

    it('can check whether the given value matches all of the given actual values', async () => {
      dom(`
        <div title="hello"></div>
      `);

      await HTML({ title: and('hello', 'hello') }).exists();
      await expect(HTML({ title: and('hello', 'monkey') }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
    });
  });
});
