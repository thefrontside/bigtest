import { describe, it } from 'mocha';
import * as expect from 'expect';
import { CheckBox, Heading } from '../../src/index';
import { dom } from '../helpers';

describe('@bigtest/interactor', () => {
  describe('CheckBox', () => {
    it('finds `input[type=checkbox]` tags by label', async () => {
      dom(`
        <label for="accept-field">Accept</label><input type="checkbox" id="accept-field"/>
      `);

      await expect(CheckBox('Accept').exists()).resolves.toBeUndefined();
      await expect(CheckBox('Does not Exist').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    describe('.click', () => {
      it('clicks on field', async () => {
        dom(`
          <p>
            <label for="acceptField">Accept</label>
            <input type="checkbox" id="acceptField"/>
            <h1 id="target"></h1>
          </p>
          <script>
            acceptField.addEventListener('click', (event) => target.textContent = 'Success');
          </script>
        `);

        await CheckBox('Accept').click();
        await Heading('Success').exists();
      });
    });

    describe('.focus', () => {
      it('focuses on field', async () => {
        dom(`
          <p>
            <label for="acceptField">Accept</label>
            <input type="checkbox" id="acceptField"/>
            <h1 id="target"></h1>
          </p>
          <script>
            acceptField.addEventListener('focus', (event) => target.textContent = 'Success');
          </script>
        `);

        await CheckBox('Accept').focus();
        await Heading('Success').exists();
      });
    });

    describe('.blur', () => {
      it('blurs field', async () => {
        dom(`
          <p>
            <label for="acceptField">Accept</label>
            <input type="checkbox" id="acceptField"/>
            <h1 id="target"></h1>
          </p>
          <script>
            acceptField.addEventListener('blur', (event) => target.textContent = 'Success');
          </script>
        `);

        await CheckBox('Accept').focus();
        await CheckBox('Accept').blur();
        await Heading('Success').exists();
      });
    });

    describe('.check', () => {
      it('checks the field if it is unchecked', async () => {
        dom(`
          <p>
            <label for="acceptField">Accept</label>
            <input type="checkbox" id="acceptField"/>
          </p>
        `);

        await CheckBox('Accept').check();
        await CheckBox('Accept').has({ checked: true });
      });

      it('does nothing if field is already checked', async () => {
        dom(`
          <p>
            <label for="acceptField">Accept</label>
            <input type="checkbox" id="acceptField" checked/>
          </p>
        `);

        await CheckBox('Accept').check();
        await CheckBox('Accept').has({ checked: true });
      });
    });

    describe('.uncheck', () => {
      it('unchecks the field if it is checked', async () => {
        dom(`
          <p>
            <label for="acceptField">Accept</label>
            <input type="checkbox" id="acceptField" checked/>
          </p>
        `);

        await CheckBox('Accept').uncheck();
        await CheckBox('Accept').has({ checked: false });
      });

      it('does nothing if field is already unchecked', async () => {
        dom(`
          <p>
            <label for="acceptField">Accept</label>
            <input type="checkbox" id="acceptField"/>
          </p>
        `);

        await CheckBox('Accept').uncheck();
        await CheckBox('Accept').has({ checked: false });
      });
    });

    describe('.toggle', () => {
      it('checks the field if it is unchecked', async () => {
        dom(`
          <p>
            <label for="acceptField">Accept</label>
            <input type="checkbox" id="acceptField"/>
          </p>
        `);

        await CheckBox('Accept').toggle();
        await CheckBox('Accept').has({ checked: true });
      });

      it('unchecks the field if it is checked', async () => {
        dom(`
          <p>
            <label for="acceptField">Accept</label>
            <input type="checkbox" id="acceptField" checked/>
          </p>
        `);

        await CheckBox('Accept').toggle();
        await CheckBox('Accept').has({ checked: false });
      });
    });

    describe('filter `title`', () => {
      it('filters `input` tags by their title', async () => {
        dom(`
          <p>
            <label for="accept-field">Accept</label>
            <input id="accept-field" type="checkbox" title="My Accept Field"/>
          </p>
        `);

        await expect(CheckBox('Accept', { title: 'My Accept Field' }).exists()).resolves.toBeUndefined();
        await expect(CheckBox('Accept', { title: 'Does not exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `disabled`', () => {
      it('filters `input` tags by their disabled state', async () => {
        dom(`
          <p><input type="checkbox" id="accept-field" disabled/></p>
          <p><input type="checkbox" id="confirm-field"/></p>
        `);

        await expect(CheckBox({ id: 'accept-field', disabled: true }).exists()).resolves.toBeUndefined();
        await expect(CheckBox({ id: 'confirm-field', disabled: false }).exists()).resolves.toBeUndefined();
        await expect(CheckBox({ id: 'accept-field', disabled: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(CheckBox({ id: 'confirm-field', disabled: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('defaults to only enabled', async () => {
        dom(`
          <p><input type="checkbox" id="name-field" disabled/></p>
          <p><input type="checkbox" id="confirm-field"/></p>
        `);

        await expect(CheckBox({ id: 'confirm-field' }).exists()).resolves.toBeUndefined();
        await expect(CheckBox({ id: 'accept-field' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `id`', () => {
      it('filters `input` tags by id', async () => {
        dom(`
          <p>
            <label for="accept-field">Accept</label>
            <input type="checkbox" id="accept-field"/>
          </p>
        `);

        await expect(CheckBox('Accept', { id: 'accept-field' }).exists()).resolves.toBeUndefined();
        await expect(CheckBox('Accept', { id: 'does-not-exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `checked`', () => {
      it('filters `input` tags by whether they are checked', async () => {
        dom(`
          <p>
            <label for="accept-field">Accept</label>
            <input type="checkbox" id="accept-field" checked/>
          </p>
        `);

        await expect(CheckBox('Accept', { checked: true }).exists()).resolves.toBeUndefined();
        await expect(CheckBox('Accept', { checked: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `valid`', () => {
      it('filters `input` tags by their validity state', async () => {
        dom(`
          <p>
            <input required type="checkbox" id="accept-field" checked/>
            <input required type="checkbox" id="confirm-field"/>
          </p>
        `);

        await expect(CheckBox({ id: 'accept-field', valid: true }).exists()).resolves.toBeUndefined();
        await expect(CheckBox({ id: 'confirm-field', valid: false }).exists()).resolves.toBeUndefined();
        await expect(CheckBox({ id: 'accept-field', valid: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(CheckBox({ id: 'confirm-field', valid: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `visible`', () => {
      it('filters `input` tags by their visibility', async () => {
        dom(`
          <p>
            <input required type="checkbox" id="accept-field" style="display:none"/>
            <input required type="checkbox" id="confirm-field"/>
          </p>
        `);

        await expect(CheckBox({ id: 'accept-field', visible: false }).exists()).resolves.toBeUndefined();
        await expect(CheckBox({ id: 'confirm-field', visible: true }).exists()).resolves.toBeUndefined();
        await expect(CheckBox({ id: 'accept-field', visible: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(CheckBox({ id: 'confirm-field', visible: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('counts as visible if its label is visible', async () => {
        dom(`
          <p>
            <input required type="checkbox" id="accept-field" style="display:none"/>
            <label for="accept-field" style="display:none">Accept</label>

            <input required type="checkbox" id="confirm-field" style="display:none"/>
            <label for="confirm-field">Confirm</label>
          </p>
        `);

        await expect(CheckBox({ id: 'accept-field', visible: false }).exists()).resolves.toBeUndefined();
        await expect(CheckBox({ id: 'confirm-field', visible: true }).exists()).resolves.toBeUndefined();
        await expect(CheckBox({ id: 'accept-field', visible: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(CheckBox({ id: 'confirm-field', visible: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('is applied by default', async () => {
        dom(`
          <p>
            <input required type="checkbox" id="accept-field" style="display:none"/>
            <input required type="checkbox" id="confirm-field"/>
          </p>
        `);

        await expect(CheckBox({ id: 'confirm-field' }).exists()).resolves.toBeUndefined();
        await expect(CheckBox({ id: 'accept-field' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });
  });
});
