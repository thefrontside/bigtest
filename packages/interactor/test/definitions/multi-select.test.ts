import { describe, it } from 'mocha';
import expect from 'expect';
import { MultiSelect, Heading } from '../../src/index';
import { dom } from '../helpers';

describe('@interactors/html', () => {
  describe('MultiSelect', () => {
    it('finds `select` tags with `multiple` by label', async () => {
      dom(`
        <label for="animal-field">Animal</label>
        <select multiple id="animal-field">
          <option>Cat</option>
          <option>Dog</option>
        </select>
      `);

      await expect(MultiSelect('Animal').exists()).resolves.toBeUndefined();
      await expect(MultiSelect('Does not Exist').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    it('does not find single-selects', async () => {
      dom(`
        <label for="animal-field">Animal</label>
        <select id="animal-field">
          <option>Cat</option>
          <option>Dog</option>
        </select>
      `);

      await expect(MultiSelect('Animal').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    describe('.click', () => {
      it('clicks on select', async () => {
        dom(`
          <select multiple id="animalField">
            <option>Cat</option>
            <option>Dog</option>
          </select>
          <h1 id="target"></h1>
          <script>
            animalField.addEventListener('click', (event) => target.textContent = 'Success');
          </script>
        `);

        await MultiSelect({ id: 'animalField' }).click();
        await Heading('Success').exists();
      });
    });

    describe('.choose', () => {
      beforeEach(() => {
        dom(`
          <select multiple id="animalField">
            <option selected value="1">Cat</option>
            <option value="2">Dog</option>
            <option disabled value="3">Llama</option>
          </select>
          <h1 id="target"></h1>
          <script>
            animalField.addEventListener('change', (event) => {
              let values = Array.from(animalField.selectedOptions).map((o) => o.label);
              target.textContent = 'Values: ' + values.join(', ');
            });
          </script>
        `);
      });

      it('selects only the given value in the select box', async () => {
        await MultiSelect({ id: 'animalField' }).choose('Dog');
        await Heading('Values: Dog').exists();
      });

      it('does nothing if the given value is already selected', async () => {
        await MultiSelect({ id: 'animalField' }).choose('Cat');
        await Heading('Values: Cat').absent();
      });

      it('throws an error if the given option does not exist', async () => {
        await expect(MultiSelect({ id: 'animalField' }).choose('Does not exist')).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('throws an error if the given option is disabled', async () => {
        await expect(MultiSelect({ id: 'animalField' }).choose('Llama')).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('.select', () => {
      beforeEach(() => {
        dom(`
          <select multiple id="animalField">
            <option selected value="1">Cat</option>
            <option value="2">Dog</option>
            <option disabled value="3">Llama</option>
          </select>
          <h1 id="target"></h1>
          <script>
            animalField.addEventListener('change', (event) => {
              let values = Array.from(animalField.selectedOptions).map((o) => o.label);
              target.textContent = 'Values: ' + values.join(', ');
            });
          </script>
        `);
      });

      it('adds the given value to the selection', async () => {
        await MultiSelect({ id: 'animalField' }).select('Dog');
        await Heading('Values: Cat, Dog').exists();
      });

      it('does nothing if the given value is already selected', async () => {
        await MultiSelect({ id: 'animalField' }).select('Cat');
        await Heading('Values: Cat').absent();
      });

      it('throws an error if the given option does not exist', async () => {
        await expect(MultiSelect({ id: 'animalField' }).select('Does not exist')).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('throws an error if the given option is disabled', async () => {
        await expect(MultiSelect({ id: 'animalField' }).select('Llama')).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('.deselect', () => {
      beforeEach(() => {
        dom(`
          <select multiple id="animalField">
            <option selected value="1">Cat</option>
            <option selected value="2">Dog</option>
            <option disabled value="3">Llama</option>
            <option value="4">Rabbit</option>
          </select>
          <h1 id="target"></h1>
          <script>
            animalField.addEventListener('change', (event) => {
              let values = Array.from(animalField.selectedOptions).map((o) => o.label);
              target.textContent = 'Values: ' + values.join(', ');
            });
          </script>
        `);
      });

      it('removes the given value from the selection', async () => {
        await MultiSelect({ id: 'animalField' }).deselect('Dog');
        await Heading('Values: Cat').exists();
      });

      it('does nothing if the given value is already deselected', async () => {
        await MultiSelect({ id: 'animalField' }).deselect('Rabbit');
        await Heading('Values: Cat, Dog').absent();
      });

      it('throws an error if the given option does not exist', async () => {
        await expect(MultiSelect({ id: 'animalField' }).deselect('Does not exist')).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('throws an error if the given option is disabled', async () => {
        await expect(MultiSelect({ id: 'animalField' }).deselect('Llama')).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('.focus', () => {
      it('focuses on field', async () => {
        dom(`
          <select multiple id="animalField">
            <option>Cat</option>
            <option>Dog</option>
          </select>
          <h1 id="target"></h1>
          <script>
            animalField.addEventListener('focus', (event) => target.textContent = 'Success');
          </script>
        `);

        await MultiSelect({ id: 'animalField' }).focus();
        await Heading('Success').exists();
      });
    });

    describe('.blur', () => {
      it('blurs field', async () => {
        dom(`
          <select multiple id="animalField">
            <option>Cat</option>
            <option>Dog</option>
          </select>
          <h1 id="target"></h1>
          <script>
            animalField.addEventListener('blur', (event) => target.textContent = 'Success');
          </script>
        `);

        await MultiSelect({ id: 'animalField' }).focus();
        await MultiSelect({ id: 'animalField' }).blur();
        await Heading('Success').exists();
      });
    });

    describe('filter `title`', () => {
      it('filters `select` tags by their title', async () => {
        dom(`
          <select multiple id="animalField" title="My Animal Field">
            <option>Cat</option>
            <option>Dog</option>
          </select>
        `);

        await expect(MultiSelect({ id: 'animalField', title: 'My Animal Field' }).exists()).resolves.toBeUndefined();
        await expect(MultiSelect({ id: 'animalField', title: 'Does not exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `disabled`', () => {
      beforeEach(() => {
        dom(`
          <select multiple id="animalField" disabled>
            <option>Cat</option>
            <option>Dog</option>
          </select>
          <select multiple id="pastaField">
            <option>Linguini</option>
            <option>Spaghetti</option>
          </select>
        `);
      });

      it('filters `select` tags by their disabled state', async () => {
        await expect(MultiSelect({ id: 'animalField', disabled: true }).exists()).resolves.toBeUndefined();
        await expect(MultiSelect({ id: 'animalField', disabled: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(MultiSelect({ id: 'pastaField', disabled: false }).exists()).resolves.toBeUndefined();
        await expect(MultiSelect({ id: 'pastaField', disabled: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('defaults to only enabled', async () => {
        await expect(MultiSelect({ id: 'animalField', disabled: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(MultiSelect({ id: 'pastaField', disabled: false }).exists()).resolves.toBeUndefined();
      });
    });

    describe('filter `id`', () => {
      it('filters `select` tags by id', async () => {
        dom(`
          <label for="animalField">Animal</label>
          <select multiple id="animalField">
            <option>Cat</option>
            <option>Dog</option>
          </select>
        `);

        await expect(MultiSelect('Animal', { id: 'animalField' }).exists()).resolves.toBeUndefined();
        await expect(MultiSelect('Animal', { id: 'does-not-exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `valid`', () => {
      it('filters `select` tags by their validity state', async () => {
        dom(`
          <select multiple id="animalField" required>
            <option>Cat</option>
            <option>Dog</option>
          </select>
          <select multiple id="pastaField" required>
            <option selected>Linguini</option>
            <option>Spaghetti</option>
          </select>
        `);

        await expect(MultiSelect({ id: 'animalField', valid: false }).exists()).resolves.toBeUndefined();
        await expect(MultiSelect({ id: 'animalField', valid: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(MultiSelect({ id: 'pastaField', valid: true }).exists()).resolves.toBeUndefined();
        await expect(MultiSelect({ id: 'pastaField', valid: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `values`', () => {
      it('filters `select` tags by their validity selected value label', async () => {
        dom(`
          <select multiple id="animalField" required>
            <option selected value="1">Cat</option>
            <option selected value="2">Dog</option>
            <option value="3">Llama</option>
          </select>
        `);

        await expect(MultiSelect({ id: 'animalField', values: ['Cat', 'Dog'] }).exists()).resolves.toBeUndefined();
        await expect(MultiSelect({ id: 'animalField', values: ['Incorrect Value'] }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `visible`', () => {
      beforeEach(() => {
        dom(`
          <select multiple id="animalField" style="display:none;">
            <option>Cat</option>
            <option>Dog</option>
          </select>
          <select multiple id="pastaField">
            <option selected>Linguini</option>
            <option>Spaghetti</option>
          </select>
        `);
      });

      it('filters `select` tags by their visibility', async () => {
        await expect(MultiSelect({ id: 'animalField', visible: false }).exists()).resolves.toBeUndefined();
        await expect(MultiSelect({ id: 'pastaField', visible: true }).exists()).resolves.toBeUndefined();
        await expect(MultiSelect({ id: 'animalField', visible: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(MultiSelect({ id: 'pastaField', visible: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('is applied by default', async () => {
        await expect(MultiSelect({ id: 'pastaField' }).exists()).resolves.toBeUndefined();
        await expect(MultiSelect({ id: 'animalField' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });
  });
});
