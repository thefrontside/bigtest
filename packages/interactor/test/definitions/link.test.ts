import { describe, it } from 'mocha';
import expect from 'expect';
import { Link, Heading } from '../../src/index';
import { dom } from '../helpers';

describe('@bigtest/interactor', () => {
  describe('Link', () => {
    it('finds `a` tags by text', async () => {
      dom(`
        <p><a href="/foobar">Foo Bar</a></p>
        <p><a href="/foobar">Quox</a></p>
      `);

      await expect(Link('Foo Bar').exists()).resolves.toBeUndefined();
      await expect(Link('Blah').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    it('does not find `a` tags without `href` attributes, since they are not considered links per the HTML spec', async () => {
      dom(`
        <p><a>Foo</a></p>
      `);

      await expect(Link('Foo').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    describe('.click', () => {
      it('clicks on link', async () => {
        dom(`
          <p><a href="#" id="foobar">Foo</a></p>
          <script>
            foobar.addEventListener('click', (event) => {
              event.preventDefault();
              let h1 = document.createElement('h1')
              h1.textContent = 'Success';
              document.body.appendChild(h1);
            });
          </script>
        `);

        await Link('Foo').click();
        await Heading('Success').exists();
      });
    });

    describe('filter `visible`', () => {
      it('filters `a` tags by their visibility', async () => {
        dom(`
          <p><a href="/foo" style="display:none;">Foo</a></p>
          <p><a href="/bar">Bar</a></p>
        `);

        await expect(Link('Foo', { visible: false }).exists()).resolves.toBeUndefined();
        await expect(Link('Bar', { visible: true }).exists()).resolves.toBeUndefined();
        await expect(Link('Foo', { visible: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(Link('Bar', { visible: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('defaults to `true`', async () => {
        dom(`
          <p><a href="/foo" style="display:none;">Foo</a></p>
          <p><a href="/bar">Bar</a></p>
        `);

        await expect(Link('Bar').exists()).resolves.toBeUndefined();
        await expect(Link('Foo').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `title`', () => {
      it('filters `a` tags by their title', async () => {
        dom(`
          <p><a href="/foo" title="My Foo Link">Foo</a></p>
          <p><a href="/bar" title="My Bar Link">Bar</a></p>
        `);

        await expect(Link('Foo', { title: 'My Foo Link' }).exists()).resolves.toBeUndefined();
        await expect(Link('Foo', { title: 'Does not exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `href`', () => {
      it('filters `a` tags by their href attributes', async () => {
        dom(`
          <p><a href="/foo">Foo</a></p>
        `);

        await expect(Link('Foo', { href: '/foo' }).exists()).resolves.toBeUndefined();
        await expect(Link('Foo', { href: '/wrong' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `id`', () => {
      it('filters `a` tags by id', async () => {
        dom(`
          <p><a href="/foo" id="foo-link">Foo</a></p>
        `);

        await expect(Link('Foo', { id: 'foo-link' }).exists()).resolves.toBeUndefined();
        await expect(Link('Foo', { id: 'does-not-exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `focused`', () => {
      it.only('filters `a` tags by if they are focused', async () => {
        dom(`
          <p><a href="/has-focus" id="with">With Focus</a></p>
          <p><a href="/does-not-have-focus" id="without">Without Focus</a></p>
          <script type="text/javascript">document.links.with.focus()</script>
        `);

        await expect(Link('With Focus').is({ focused: true })).resolves.toBeUndefined();
        await expect(Link('Without Focus', { focused: true }).absent()).resolves.toBeUndefined();
      });
    });
  });
});
