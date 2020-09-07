import { describe, it } from 'mocha';
import * as expect from 'expect';
import { Heading } from '../../src/index';
import { dom } from '../helpers';

describe('@bigtest/interactor', () => {
  describe('Heading', () => {
    it('finds `h1`, `h2`, etc... tags by text', async () => {
      dom(`
        <h1>Foo</h1>
        <h6>Bar</h6>
        <p>Quox</p>
      `);

      await expect(Heading('Foo').exists()).resolves.toBeUndefined();
      await expect(Heading('Bar').exists()).resolves.toBeUndefined();
      await expect(Heading('Quox').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    describe('filter `level`', () => {
      it('filters heading tags by their heading level', async () => {
        dom(`
          <h2>Foo</h2>
        `);

        await expect(Heading('Foo', { level: 2 }).exists()).resolves.toBeUndefined();
        await expect(Heading('Foo', { level: 3 }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });
  });
});
