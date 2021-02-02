import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from '../helpers';

import { HTML, and, including } from '../../src/index';

describe('@bigtest/interactor', () => {
  describe('and', () => {
    it('can provide description', () => {
      expect(and('foo', including('bar')).format()).toEqual('"foo" and including "bar"');
    });

    it('can check whether the given value matches all of the given matchers', async () => {
      dom(`
        <div title="hello cruel world"></div>
      `);

      await HTML({ title: and(including('world'), including('hello')) }).exists();
      await HTML({ title: and(including('world'), including('hello'), including('cruel')) }).exists();
      await expect(HTML({ title: and(including('world'), including('monkey')) }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
      await expect(HTML({ title: and(including('monkey'), including('hello')) }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
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
