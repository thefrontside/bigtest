import { describe, it } from 'mocha';
import expect from 'expect';
import { Select, Heading } from '../../src/index';
import { dom } from '../helpers';

describe('@bigtest/interactor', () => {
  describe('Select', () => {
    it('finds `select` tags by label', async () => {
      dom(`
        <label for="animal-field">Animal</label>
        <select id="animal-field">
          <option>Cat</option>
          <option>Dog</option>
        </select>
      `);

      await expect(Select('Animal').exists()).resolves.toBeUndefined();
      await expect(Select('Does not Exist').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    it('does not find multi-selects', async () => {
      dom(`
        <label for="animal-field">Animal</label>
        <select multiple id="animal-field">
          <option>Cat</option>
          <option>Dog</option>
        </select>
      `);

      await expect(Select('Animal').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    describe('.click', () => {
      it('clicks on select', async () => {
        dom(`
          <select id="animalField">
            <option>Cat</option>
            <option>Dog</option>
          </select>
          <h1 id="target"></h1>
          <script>
            animalField.addEventListener('click', (event) => target.textContent = 'Success');
          </script>
        `);

        await Select({ id: 'animalField' }).click();
        await Heading('Success').exists();
      });
    });

    describe('.choose', () => {
      beforeEach(() => {
        dom(`
          <select id="animalField">
            <option selected value="1">Cat</option>
            <option value="2">Dog</option>
            <option disabled value="3">Llama</option>
          </select>
          <h1 id="target"></h1>
          <script>
            animalField.addEventListener('change', (event) => target.textContent = 'Value: ' + animalField.value);
          </script>
        `);
      });

      it('selects the given value in the select box', async () => {
        await Select({ id: 'animalField' }).choose('Dog');
        await Heading('Value: 2').exists();
      });

      it('does nothing if the given value is already selected', async () => {
        await Select({ id: 'animalField' }).choose('Cat');
        await Heading('Value: 1').absent();
      });

      it('throws an error if the given option does not exist', async () => {
        await expect(Select({ id: 'animalField' }).choose('Does not exist')).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('throws an error if the given option is disabled', async () => {
        await expect(Select({ id: 'animalField' }).choose('Llama')).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('.focus', () => {
      it('focuses on field', async () => {
        dom(`
          <select id="animalField">
            <option>Cat</option>
            <option>Dog</option>
          </select>
          <h1 id="target"></h1>
          <script>
            animalField.addEventListener('focus', (event) => target.textContent = 'Success');
          </script>
        `);

        await Select({ id: 'animalField' }).focus();
        await Heading('Success').exists();
      });
    });

    describe('.blur', () => {
      it('blurs field', async () => {
        dom(`
          <select id="animalField">
            <option>Cat</option>
            <option>Dog</option>
          </select>
          <h1 id="target"></h1>
          <script>
            animalField.addEventListener('blur', (event) => target.textContent = 'Success');
          </script>
        `);

        await Select({ id: 'animalField' }).focus();
        await Select({ id: 'animalField' }).blur();
        await Heading('Success').exists();
      });
    });

    describe('filter `title`', () => {
      it('filters `select` tags by their title', async () => {
        dom(`
          <select id="animalField" title="My Animal Field">
            <option>Cat</option>
            <option>Dog</option>
          </select>
        `);

        await expect(Select({ id: 'animalField', title: 'My Animal Field' }).exists()).resolves.toBeUndefined();
        await expect(Select({ id: 'animalField', title: 'Does not exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `disabled`', () => {
      beforeEach(() => {
        dom(`
          <select id="animalField" disabled>
            <option>Cat</option>
            <option>Dog</option>
          </select>
          <select id="pastaField">
            <option>Linguini</option>
            <option>Spaghetti</option>
          </select>
        `);
      });

      it('filters `select` tags by their disabled state', async () => {
        await expect(Select({ id: 'animalField', disabled: true }).exists()).resolves.toBeUndefined();
        await expect(Select({ id: 'animalField', disabled: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(Select({ id: 'pastaField', disabled: false }).exists()).resolves.toBeUndefined();
        await expect(Select({ id: 'pastaField', disabled: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('defaults to only enabled', async () => {
        await expect(Select({ id: 'animalField', disabled: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(Select({ id: 'pastaField', disabled: false }).exists()).resolves.toBeUndefined();
      });
    });

    describe('filter `id`', () => {
      it('filters `select` tags by id', async () => {
        dom(`
          <label for="animalField">Animal</label>
          <select id="animalField">
            <option>Cat</option>
            <option>Dog</option>
          </select>
        `);

        await expect(Select('Animal', { id: 'animalField' }).exists()).resolves.toBeUndefined();
        await expect(Select('Animal', { id: 'does-not-exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `valid`', () => {
      it('filters `select` tags by their validity state', async () => {
        dom(`
          <select id="animalField" required>
            <option selected></option>
            <option>Cat</option>
            <option>Dog</option>
          </select>
          <select id="pastaField" required>
            <option selected>Linguini</option>
            <option>Spaghetti</option>
          </select>
        `);

        await expect(Select({ id: 'animalField', valid: false }).exists()).resolves.toBeUndefined();
        await expect(Select({ id: 'animalField', valid: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(Select({ id: 'pastaField', valid: true }).exists()).resolves.toBeUndefined();
        await expect(Select({ id: 'pastaField', valid: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `value`', () => {
      it('filters `select` tags by their validity selected value label', async () => {
        dom(`
          <select id="animalField" required>
            <option selected value="1">Cat</option>
            <option value="2">Dog</option>
          </select>
        `);

        await expect(Select({ id: 'animalField', value: 'Cat' }).exists()).resolves.toBeUndefined();
        await expect(Select({ id: 'animalField', value: 'Incorrect Value' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `visible`', () => {
      beforeEach(() => {
        dom(`
          <select id="animalField" style="display:none;">
            <option>Cat</option>
            <option>Dog</option>
          </select>
          <select id="pastaField">
            <option selected>Linguini</option>
            <option>Spaghetti</option>
          </select>
        `);
      });

      it('filters `select` tags by their visibility', async () => {
        await expect(Select({ id: 'animalField', visible: false }).exists()).resolves.toBeUndefined();
        await expect(Select({ id: 'pastaField', visible: true }).exists()).resolves.toBeUndefined();
        await expect(Select({ id: 'animalField', visible: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(Select({ id: 'pastaField', visible: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('is applied by default', async () => {
        await expect(Select({ id: 'pastaField' }).exists()).resolves.toBeUndefined();
        await expect(Select({ id: 'animalField' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });
  });
});
