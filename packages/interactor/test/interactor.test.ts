import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from './helpers';
import { bigtestGlobals } from '@bigtest/globals';

import { createInteractor, Link, Heading } from '../src/index';

const MainNav = createInteractor('main nav')({
  selector: 'nav'
});

describe('@interactors/html', () => {
  describe('instantiation', () => {
    describe('no arguments', () => {
      it('just uses the selector to locate', async () => {
        dom(`
          <nav id="main-nav"></nav>
        `);

        await expect(MainNav().exists()).resolves.toBeUndefined();
      });
    });
  });

  describe('.perform', () => {
    it('can use action to interact with element', async () => {
      dom(`
        <a id="foo" href="/foobar">Foo Bar</a>
        <div id="target"></div>
        <script>
          foo.onclick = () => {
            target.innerHTML = '<h1>Hello!</h1>';
          }
        </script>
      `);

      await Link('Foo Bar').perform((e) => e.click());
      await Heading('Hello!').exists();
    });

    it('does nothing unless awaited', async () => {
      dom(`
        <a id="foo" href="/foobar">Foo Bar</a>
        <div id="target"></div>
        <script>
          foo.onclick = () => {
            target.innerHTML = '<h1>Hello!</h1>';
          }
        </script>
      `);

      Link('Foo Bar').perform((e) => e.click());
      await Heading('Hello!').absent();
    });

    it('can return description of interaction', () => {
      expect(Link('Foo Bar').perform((e) => e.click()).description).toEqual('link "Foo Bar" performs');
    });

    it('throws an error if ambiguous', async () => {
      dom(`
        <p><a href="/foo">Foo</a></p>
        <p><a href="/bar&quot;">Foo</a></p>
      `);

      await expect(Link('Foo').perform((e) => e.click())).rejects.toHaveProperty('message', [
        'link "Foo" matches multiple elements:', '',
        '- <a href="/foo">',
        '- <a href="/bar&quot;">',
      ].join('\n'))
    });

    it('throws an error if runner is currently in assertion state', async () => {
      dom(`
        <p><a href="/foo">Foo</a></p>
      `);

      bigtestGlobals.runnerState = 'assertion';

      await expect(Link('Foo').perform((e) => e.click())).rejects.toHaveProperty('message',
        'tried to run perform on link "Foo" in an assertion, perform should only be run in steps'
      );
    });

    it('returns a value outside', async () => {
      dom(`
        <a data-foo="bar" href="/foobar">Foo</a>
      `);

      await expect(Link('Foo').perform((e) => e.getAttribute('data-foo'))).resolves.toEqual('bar')
    })
  });

  describe('.assert', () => {
    it('can assert on state', async () => {
      dom(`
        <a data-foo="foo" href="/foobar">Foo Bar</a>
      `);

      await Link('Foo Bar').assert((e) => expect(e.dataset.foo).toEqual('foo'));
    });

    it('is rejected if assertion fails', async () => {
      dom(`
        <a data-foo="foo" href="/foobar">Foo Bar</a>
      `);

      await expect(Link('Foo Bar').assert((e) => expect(e.dataset.foo).toEqual('incorrect'))).rejects;
    });

    it('can return description of interaction', () => {
      expect(Link('Foo Bar').assert(() => true).description).toEqual('link "Foo Bar" asserts');
    });

    it('throws an error if ambiguous', async () => {
      dom(`
        <p><a href="/foo">Foo</a></p>
        <p><a href="/bar&quot;">Foo</a></p>
      `);

      await expect(Link('Foo').assert(() => true)).rejects.toHaveProperty('message', [
        'link "Foo" matches multiple elements:', '',
        '- <a href="/foo">',
        '- <a href="/bar&quot;">',
      ].join('\n'))
    });

    it('can be used normally if runner is currently in assertion state', async () => {
      dom(`
        <a data-foo="foo" href="/foobar">Foo Bar</a>
      `);

      bigtestGlobals.runnerState = 'assertion';

      await Link('Foo Bar').assert((e) => expect(e.dataset.foo).toEqual('foo'));
    });
  });
});
