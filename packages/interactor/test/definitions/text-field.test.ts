import { describe, it } from 'mocha';
import expect from 'expect';
import { TextField, Heading } from '../../src/index';
import { dom } from '../helpers';

describe('@bigtest/interactor', () => {
  describe('TextField', () => {
    it('finds `input` tags without type by label', async () => {
      dom(`
        <label for="name-field">Name</label><input id="name-field"/>
      `);

      await expect(TextField('Name').exists()).resolves.toBeUndefined();
      await expect(TextField('Does not Exist').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    it('finds `input[type=text]` tags by label', async () => {
      dom(`
        <label for="name-field">Name</label><input type="text" id="name-field"/>
      `);

      await expect(TextField('Name').exists()).resolves.toBeUndefined();
      await expect(TextField('Does not Exist').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    it('finds `textarea` tags by label', async () => {
      dom(`
        <label for="name-field">Name</label>
        <textarea id="name-field"></textarea>
      `);

      await expect(TextField('Name').exists()).resolves.toBeUndefined();
      await expect(TextField('Does not Exist').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    it('finds `input` tags with custom type', async () => {
      dom(`
        <label for="name-field">Name</label><input type="monkey" id="name-field"/>
      `);

      await expect(TextField('Name').exists()).resolves.toBeUndefined();
      await expect(TextField('Does not Exist').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    it('does not find non text field inputs', async () => {
      dom(`
        <label for="name-field">Name</label><input type="range" id="name-field"/>
      `);

      await expect(TextField('Name').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    it('does not yet support multiple label tags per `input`, only picks the first one', async () => {
      dom(`
        <label for="name-field">Name</label>
        <label for="name-field">Designation</label>
        <input id="name-field"/>
      `);

      await expect(TextField('Name').exists()).resolves.toBeUndefined();
      await expect(TextField('Designation').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    describe('.click', () => {
      it('clicks on field', async () => {
        dom(`
          <p>
            <label for="nameField">Name</label>
            <input type="text" id="nameField"/>
            <h1 id="target"></h1>
          </p>
          <script>
            nameField.addEventListener('click', (event) => target.textContent = 'Success');
          </script>
        `);

        await TextField('Name').click();
        await Heading('Success').exists();
      });
    });

    describe('.focus', () => {
      it('focuses on field', async () => {
        dom(`
          <p>
            <label for="nameField">Name</label>
            <input type="text" id="nameField"/>
            <h1 id="target"></h1>
          </p>
          <script>
            nameField.addEventListener('focus', (event) => target.textContent = 'Success');
          </script>
        `);

        await TextField('Name').focus();
        await TextField('Name').is({ focused: true });
        await Heading('Success').exists();
      });
    });

    describe('.blur', () => {
      it('blurs field', async () => {
        dom(`
          <p>
            <label for="nameField">Name</label>
            <input type="text" id="nameField"/>
            <h1 id="target"></h1>
          </p>
          <script>
            nameField.addEventListener('blur', (event) => target.textContent = 'Success');
          </script>
        `);

        await TextField('Name').focus();
        await TextField('Name').blur();
        await TextField('Name').is({ focused: false });
        await Heading('Success').exists();
      });
    });

    describe('.fillIn', () => {
      it('fills in the field', async () => {
        dom(`
          <p>
            <label for="nameField">Name</label>
            <input type="text" id="nameField"/>
          </p>
        `);

        await TextField('Name').fillIn('John');
        await TextField('Name').has({ value: 'John' });
      });
    });

    describe('filter `title`', () => {
      it('filters `input` tags by their title', async () => {
        dom(`
          <p>
            <label for="name-field">Name</label>
            <input id="name-field" type="text" title="My Name Field"/>
          </p>
        `);

        await expect(TextField('Name', { title: 'My Name Field' }).exists()).resolves.toBeUndefined();
        await expect(TextField('Name', { title: 'Does not exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `disabled`', () => {
      it('filters `input` tags by their disabled state', async () => {
        dom(`
          <p><input id="name-field" disabled/></p>
          <p><input id="address-field"/></p>
        `);

        await expect(TextField({ id: 'name-field', disabled: true }).exists()).resolves.toBeUndefined();
        await expect(TextField({ id: 'address-field', disabled: false }).exists()).resolves.toBeUndefined();
        await expect(TextField({ id: 'name-field', disabled: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(TextField({ id: 'address-field', disabled: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('defaults to only enabled', async () => {
        dom(`
          <p><input id="name-field" disabled/></p>
          <p><input id="address-field"/></p>
        `);

        await expect(TextField({ id: 'address-field' }).exists()).resolves.toBeUndefined();
        await expect(TextField({ id: 'name-field' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `id`', () => {
      it('filters `input` tags by id', async () => {
        dom(`
          <p>
            <label for="name-field">Name</label>
            <input id="name-field"/>
          </p>
        `);

        await expect(TextField('Name', { id: 'name-field' }).exists()).resolves.toBeUndefined();
        await expect(TextField('Name', { id: 'does-not-exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `value`', () => {
      it('filters `input` tags by value', async () => {
        dom(`
          <p>
            <label for="name-field">Name</label>
            <input id="name-field" value="John"/>
          </p>
        `);

        await expect(TextField('Name', { value: 'John' }).exists()).resolves.toBeUndefined();
        await expect(TextField('Name', { value: 'Does not Exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `placeholder`', () => {
      it('filters `input` tags by placeholder', async () => {
        dom(`
          <p>
            <label for="name-field">Name</label>
            <input id="name-field" placeholder="Your Name"/>
          </p>
        `);

        await expect(TextField('Name', { placeholder: 'Your Name' }).exists()).resolves.toBeUndefined();
        await expect(TextField('Name', { placeholder: 'Does not Exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `valid`', () => {
      it('filters `input` tags by their validity state', async () => {
        dom(`
          <p>
            <input required id="name-field" value="John"/>
            <input required id="address-field"/>
          </p>
        `);

        await expect(TextField({ id: 'name-field', valid: true }).exists()).resolves.toBeUndefined();
        await expect(TextField({ id: 'address-field', valid: false }).exists()).resolves.toBeUndefined();
        await expect(TextField({ id: 'name-field', valid: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(TextField({ id: 'address-field', valid: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });
  });
});
