import { describe, it } from 'mocha';
import expect from 'expect';
import { Button, Heading } from '../../src/index';
import { dom } from '../helpers';

describe('@bigtest/interactor', () => {
  describe('Button', () => {
    it('finds `button` tags by text', async () => {
      dom(`
        <p><button>Foo Bar</button></p>
        <p><button>Quox</button></p>
      `);

      await expect(Button('Foo Bar').exists()).resolves.toBeUndefined();
      await expect(Button('Does not Exist').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    it('finds `input[type=button]` tags by value', async () => {
      dom(`
        <p><input type="button" value="Foo Bar"/></p>
        <p><input type="button" value="Quox"/></p>
      `);

      await expect(Button('Foo Bar').exists()).resolves.toBeUndefined();
      await expect(Button('Does not Exist').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    it('finds `input[type=submit]` tags by value', async () => {
      dom(`
        <p><input type="submit" value="Foo Bar"/></p>
        <p><input type="submit" value="Quox"/></p>
      `);

      await expect(Button('Foo Bar').exists()).resolves.toBeUndefined();
      await expect(Button('Does not Exist').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    it('finds `input[type=reset]` tags by value', async () => {
      dom(`
        <p><input type="reset" value="Foo Bar"/></p>
        <p><input type="reset" value="Quox"/></p>
      `);

      await expect(Button('Foo Bar').exists()).resolves.toBeUndefined();
      await expect(Button('Does not Exist').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    it('finds `input[type=image]` tags by alt text', async () => {
      dom(`
        <p><input type="image" alt="Foo Bar"/></p>
        <p><input type="image" alt="Quox"/></p>
      `);

      await expect(Button('Foo Bar').exists()).resolves.toBeUndefined();
      await expect(Button('Does not Exist').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    describe('.click', () => {
      it('clicks on button', async () => {
        dom(`
          <p><button id="foobar">Foo</button></p>
          <script>
            foobar.addEventListener('click', (event) => {
              event.preventDefault();
              let h1 = document.createElement('h1')
              h1.textContent = 'Success';
              document.body.appendChild(h1);
            });
          </script>
        `);

        await Button('Foo').click();
        await Heading('Success').exists();
      });
    });

    describe('.focus', () => {
      it('focuses on button', async () => {
        dom(`
          <p><button id="foobar">Foo</button></p>
          <script>
            foobar.addEventListener('focus', (event) => {
              event.preventDefault();
              let h1 = document.createElement('h1')
              h1.textContent = 'Success';
              document.body.appendChild(h1);
            });
          </script>
        `);

        await Button('Foo').focus();
        await Button('Foo').is({ focused: true });
        await Heading('Success').exists();
      });
    });

    describe('.blur', () => {
      it('focuses on button', async () => {
        dom(`
          <p><button id="foobar">Foo</button></p>
          <script>
            foobar.addEventListener('blur', (event) => {
              event.preventDefault();
              let h1 = document.createElement('h1')
              h1.textContent = 'Success';
              document.body.appendChild(h1);
            });
          </script>
        `);

        await Button('Foo').focus();
        await Button('Foo').blur();
        await Heading('Success').exists();
        await Button('Foo').is({ focused: false });
      });
    });

    describe('filter `title`', () => {
      it('filters `button` and `input` tags by their title', async () => {
        dom(`
          <p><button title="My Foo Button">Foo</button></p>
        `);

        await expect(Button('Foo', { title: 'My Foo Button' }).exists()).resolves.toBeUndefined();
        await expect(Button('Foo', { title: 'Does not exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `disabled`', () => {
      it('filters `button` and `input` tags by their disabled state', async () => {
        dom(`
          <p><button disabled>Foo</button></p>
          <p><input type="button" value="Bar"/></p>
        `);

        await expect(Button('Foo', { disabled: true }).exists()).resolves.toBeUndefined();
        await expect(Button('Bar', { disabled: false }).exists()).resolves.toBeUndefined();
        await expect(Button('Foo', { disabled: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(Button('Bar', { disabled: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('defaults to only enabled', async () => {
        dom(`
          <p><button disabled>Foo</button></p>
          <p><input type="button" value="Bar"/></p>
        `);

        await expect(Button('Bar').exists()).resolves.toBeUndefined();
        await expect(Button('Foo').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `id`', () => {
      it('filters `button` and `input` tags by id', async () => {
        dom(`
          <p><button id="foo-button">Foo</button></p>
        `);

        await expect(Button('Foo', { id: 'foo-button' }).exists()).resolves.toBeUndefined();
        await expect(Button('Foo', { id: 'does-not-exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });
  });
});
