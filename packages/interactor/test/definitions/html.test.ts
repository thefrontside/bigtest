import { describe, it } from 'mocha';
import expect from 'expect';
import { HTML } from '../../src/index';
import { dom } from '../helpers';

describe('@bigtest/interactor', () => {
  describe('HTML', () => {
    it('finds any tag by text', async () => {
      dom(`
        <p>Foo</p>
        <button>Bar</button>
      `);

      await expect(HTML('Foo').exists()).resolves.toBeUndefined();
      await expect(HTML('Bar').exists()).resolves.toBeUndefined();
      await expect(HTML('Blah').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    });

    it('finds html elements only', async () => {
      dom(`
        <svg id="spam">
          <circle class="circle" cx="40" cy="40" r="25" />
          <foreignObject>
            <div>Baz</div>
          </foreignObject>
        </svg>
      `)

      await expect(HTML('Baz').exists()).resolves.toBeUndefined();
      await expect(HTML({ className: 'circle' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      await expect(HTML({ id: 'spam' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
    })

    describe('.click', () => {
      it('clicks on element', async () => {
        dom(`
          <p id="clickable">Click here</p>
          <div id="target"></div>
          <script>
            clickable.addEventListener('click', (event) => {
              event.preventDefault();
              target.textContent = 'Clicked!';
            });
          </script>
        `);

        await HTML('Click here').click();
        await HTML({ id: 'target' }).has({ text: "Clicked!" });
      });
    });

    describe('filter `text`', () => {
      it('filters tags by their title', async () => {
        dom(`
          <p id="paragraph">Some text here</p>
        `);

        await HTML({ id: 'paragraph' }).has({ text: 'Some text here' });
        await expect(HTML({ id: 'paragraph' }).has({ text: 'Wrong' })).rejects.toHaveProperty('name', 'FilterNotMatchingError');
      });
    });

    describe('filter `title`', () => {
      it('filters tags by their title', async () => {
        dom(`
          <p title="My Foo Link">Foo</p>
          <p title="My Bar Link">Bar</p>
        `);

        await expect(HTML('Foo', { title: 'My Foo Link' }).exists()).resolves.toBeUndefined();
        await expect(HTML('Foo', { title: 'Does not exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `id`', () => {
      it('filters tags by id', async () => {
        dom(`
          <p><a href="/foo" id="foo-link">Foo</a></p>
        `);

        await expect(HTML('Foo', { id: 'foo-link' }).exists()).resolves.toBeUndefined();
        await expect(HTML('Foo', { id: 'does-not-exist' }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `visible`', () => {
      it('filters elements by their visibility', async () => {
        dom(`
          <p style="display:none;">Foo</p>
          <p>Bar</p>
        `);

        await expect(HTML('Foo', { visible: false }).exists()).resolves.toBeUndefined();
        await expect(HTML('Bar', { visible: true }).exists()).resolves.toBeUndefined();
        await expect(HTML('Foo', { visible: true }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
        await expect(HTML('Bar', { visible: false }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });

      it('defaults to `true`', async () => {
        dom(`
          <p style="display:none;">Foo</p>
          <p>Bar</p>
        `);

        await expect(HTML('Bar').exists()).resolves.toBeUndefined();
        await expect(HTML('Foo').exists()).rejects.toHaveProperty('name', 'NoSuchElementError');
      });
    });

    describe('filter `className`', () => {
      it('filters tags by their class name', async () => {
        dom(`
          <p class="quox baz">Foo</p>
        `);

        await HTML('Foo').has({ className: 'quox baz' });
        await expect(HTML('Foo').has({ className: 'wrong' })).rejects.toHaveProperty('name', 'FilterNotMatchingError');
      });
    });

    describe('filter `classList`', () => {
      it('filters tags by their list of class names', async () => {
        dom(`
          <p class="quox baz">Foo</p>
        `);

        await HTML('Foo').has({ classList: ['quox', 'baz'] });
        await expect(HTML('Foo').has({ classList: ['wrong', 'stuff'] })).rejects.toHaveProperty('name', 'FilterNotMatchingError');
      });
    });

    describe('filter `focused`', () => {
      it('filters tags by if they are focused', async () => {
        dom(`
          <a href="/has-focus" id="with">With Focus</a>
          <a href="/does-not-have-focus" id="without">Without Focus</a>
          <script type="text/javascript">document.links.with.focus()</script>
        `);

        await expect(HTML('With Focus').is({ focused: true })).resolves.toBeUndefined();
        await expect(HTML('Without Focus', { focused: true }).absent()).resolves.toBeUndefined();
      });
    });
  });
});
