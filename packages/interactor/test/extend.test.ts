import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from './helpers';

import { createInteractor } from '../src/index';

const HTML = createInteractor<HTMLElement>('element')
  .filters({
    title: (element) => element.title,
  })
  .actions({
    click: ({ perform }) => perform(element => { element.click() }),
  });

const Link = HTML.extend<HTMLLinkElement>('link')
  .selector('a')
  .filters({
    href: (element) => element.href,
  })
  .actions({
    setHref: ({ perform }, value: string) => perform((element) => { element.href = value })
  })

const Thing = HTML.extend<HTMLLinkElement>('div')
  .selector('div')
  .filters({
    title: (element) => parseInt(element.dataset.title || '0'),
  })
  .actions({
    click(interactor, value: number) {
      return interactor.perform((element) => {
        element.dataset.title = value.toString();
      });
    }
  })

const Header = createInteractor('header')
  .selector('h1,h2,h3,h4,h5,h6')

describe('@bigtest/interactor', () => {
  describe('.extend', () => {
    it('can use filters from base interactor', async () => {
      dom(`
        <p><a href="/foobar" title="Foo">Foo Bar</a></p>
      `);

      await expect(Link('Foo Bar').has({ title: "Foo" })).resolves.toBeUndefined();
      await expect(Link('Foo Bar').has({ title: "Quox" })).rejects.toHaveProperty('message', [
        'link "Foo Bar" does not match filters:', '',
        '╒═ Filter:   title',
        '├─ Expected: "Quox"',
        '└─ Received: "Foo"',
      ].join('\n'));
    });

    it('can use filters from extended interactor', async () => {
      dom(`
        <p><a href="/foobar" title="Foo">Foo Bar</a></p>
      `);

      await expect(Link('Foo Bar').has({ href: "/foobar" })).resolves.toBeUndefined();
      await expect(Link('Foo Bar').has({ href: "/quox" })).rejects.toHaveProperty('message', [
        'link "Foo Bar" does not match filters:', '',
        '╒═ Filter:   href',
        '├─ Expected: "/quox"',
        '└─ Received: "/foobar"',
      ].join('\n'));
    });

    it('can use actions from base interactor', async () => {
      dom(`
        <a id="foo" href="/foobar">Foo Bar</a>
        <div id="target"></div>
        <script>
          foo.onclick = () => {
            target.innerHTML = '<h1>Hello!</h1>';
          }
        </script>
      `);

      await Link('Foo Bar').click();
      await Header('Hello!').exists();
    });

    it('can use actions from extended interactor', async () => {
      dom(`
        <a id="foo" href="/foobar">Foo Bar</a>
      `);

      await Link('Foo Bar').setHref('/monkey');
      await Link({ href: '/monkey' }).exists();
    });

    it('can use overridden filters and actions', async () => {
      dom(`
        <div></div>
      `);

      await Thing().click(4);
      await Thing().has({ title: 4 });
    });
  });
});
