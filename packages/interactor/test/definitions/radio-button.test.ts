import { describe, it } from 'mocha';
import expect from 'expect';
import { RadioButton, Heading } from '../../src/index';
import { dom } from '../helpers';

describe('@bigtest/interactor', () => {
  describe('RadioButton', () => {
    it('finds `input[type=radio]` tags by label', async () => {
      dom(`
        <label for="accept-field">Accept</label><input type="radio" id="accept-field"/>
      `);

      await expect(RadioButton('Accept').exists()).resolves.toBeUndefined();
      await expect(RadioButton('Does not Exist').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    describe('.click', () => {
      it('clicks on field', async () => {
        dom(`
          <p>
            <label for="acceptField">Accept</label>
            <input type="radio" id="acceptField"/>
            <h1 id="target"></h1>
          </p>
          <script>
            acceptField.addEventListener('click', (event) => target.textContent = 'Success');
          </script>
        `);

        await RadioButton('Accept').click();
        await Heading('Success').exists();
      });
    });

    describe('.choose', () => {
      it('clicks on field', async () => {
        dom(`
          <p>
            <label for="acceptField">Accept</label>
            <input type="radio" id="acceptField"/>
            <h1 id="target"></h1>
          </p>
          <script>
            acceptField.addEventListener('click', (event) => target.textContent = 'Success');
          </script>
        `);

        await RadioButton('Accept').choose();
        await Heading('Success').exists();
      });
    });

    describe('filter `title`', () => {
      it('filters `input` tags by their title', async () => {
        dom(`
          <p>
            <label for="accept-field">Accept</label>
            <input id="accept-field" type="radio" title="My Accept Field"/>
          </p>
        `);

        await expect(RadioButton('Accept', { title: 'My Accept Field' }).exists()).resolves.toBeUndefined();
        await expect(RadioButton('Accept', { title: 'Does not exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `disabled`', () => {
      it('filters `input` tags by their disabled state', async () => {
        dom(`
          <p><input type="radio" id="accept-field" disabled/></p>
          <p><input type="radio" id="confirm-field"/></p>
        `);

        await expect(RadioButton({ id: 'accept-field', disabled: true }).exists()).resolves.toBeUndefined();
        await expect(RadioButton({ id: 'confirm-field', disabled: false }).exists()).resolves.toBeUndefined();
        await expect(RadioButton({ id: 'accept-field', disabled: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(RadioButton({ id: 'confirm-field', disabled: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('defaults to only enabled', async () => {
        dom(`
          <p><input type="radio" id="name-field" disabled/></p>
          <p><input type="radio" id="confirm-field"/></p>
        `);

        await expect(RadioButton({ id: 'confirm-field' }).exists()).resolves.toBeUndefined();
        await expect(RadioButton({ id: 'accept-field' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `id`', () => {
      it('filters `input` tags by id', async () => {
        dom(`
          <p>
            <label for="accept-field">Accept</label>
            <input type="radio" id="accept-field"/>
          </p>
        `);

        await expect(RadioButton('Accept', { id: 'accept-field' }).exists()).resolves.toBeUndefined();
        await expect(RadioButton('Accept', { id: 'does-not-exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `checked`', () => {
      it('filters `input` tags by whether they are checked', async () => {
        dom(`
          <p>
            <label for="accept-field">Accept</label>
            <input type="radio" id="accept-field" checked/>
          </p>
        `);

        await expect(RadioButton('Accept', { checked: true }).exists()).resolves.toBeUndefined();
        await expect(RadioButton('Accept', { checked: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `valid`', () => {
      it('filters `input` tags by their validity state', async () => {
        dom(`
          <p>
            <input required type="radio" id="accept-field" checked/>
            <input required type="radio" id="confirm-field"/>
          </p>
        `);

        await expect(RadioButton({ id: 'accept-field', valid: true }).exists()).resolves.toBeUndefined();
        await expect(RadioButton({ id: 'confirm-field', valid: false }).exists()).resolves.toBeUndefined();
        await expect(RadioButton({ id: 'accept-field', valid: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(RadioButton({ id: 'confirm-field', valid: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `visible`', () => {
      it('filters `input` tags by their visibility', async () => {
        dom(`
          <p>
            <input required type="radio" id="accept-field" style="display:none"/>
            <input required type="radio" id="confirm-field"/>
          </p>
        `);

        await expect(RadioButton({ id: 'accept-field', visible: false }).exists()).resolves.toBeUndefined();
        await expect(RadioButton({ id: 'confirm-field', visible: true }).exists()).resolves.toBeUndefined();
        await expect(RadioButton({ id: 'accept-field', visible: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(RadioButton({ id: 'confirm-field', visible: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('counts as visible if its label is visible', async () => {
        dom(`
          <p>
            <input required type="radio" id="accept-field" style="display:none"/>
            <label for="accept-field" style="display:none">Accept</label>

            <input required type="radio" id="confirm-field" style="display:none"/>
            <label for="confirm-field">Confirm</label>
          </p>
        `);

        await expect(RadioButton({ id: 'accept-field', visible: false }).exists()).resolves.toBeUndefined();
        await expect(RadioButton({ id: 'confirm-field', visible: true }).exists()).resolves.toBeUndefined();
        await expect(RadioButton({ id: 'accept-field', visible: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(RadioButton({ id: 'confirm-field', visible: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('is applied by default', async () => {
        dom(`
          <p>
            <input required type="radio" id="accept-field" style="display:none"/>
            <input required type="radio" id="confirm-field"/>
          </p>
        `);

        await expect(RadioButton({ id: 'confirm-field' }).exists()).resolves.toBeUndefined();
        await expect(RadioButton({ id: 'accept-field' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `focused`', () => {
      it.only('filters radio buttons by whether they have focus', async () => {
        dom(`
          <p>
            <input required type="radio" id="focused"/>
            <input required type="radio" id="not-focused"/>
            <script type="text/javascript">document.getElementById('focused').focus()</script>
          </p>
`);

        await RadioButton({id: 'focused'}).is({ focused: true });
        await RadioButton({id: 'not-focused', focused: true }).absent();
      });
    });
  });
});
