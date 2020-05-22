import { describe, it } from 'mocha';
import * as expect from 'expect'
import { JSDOM } from 'jsdom';

import { interactor, setDefaultOptions } from '../src/index';

process.on('unhandledRejection', () => {
  // do nothing
});

const Link = interactor({
  name: 'link',
  selector: 'a',
  defaultLocator: (element) => element.textContent || "",
  actions: {
    click: (element) => { element.click() }
  }
});

const Header = interactor({
  name: 'header',
  selector: 'h1,h2,h3,h4,h5,h6',
  defaultLocator: (element) => element.textContent || ""
});

function dom(html: string) {
  let jsdom = new JSDOM(`<!doctype html><html><body>${html}</body></html>`, { runScripts: "dangerously" });
  setDefaultOptions({
    document: jsdom.window.document,
    timeout: 20,
  });
}

describe('@bigtest/interactor', () => {
  describe('.exists', () => {
    it('can determine whether an element exists based on the interactor', async () => {
      dom(`
        <p><a href="/foobar">Foo Bar</a></p>
      `);

      await expect(Link('Foo Bar').exists()).resolves.toEqual(true);
      await expect(Link('Blah').exists()).rejects.toHaveProperty('message', 'link "Blah" does not exist');
    });

    it('can wait for condition to become true', async () => {
      dom(`
        <p id="foo"></p>
        <script>
          setTimeout(() => {
            foo.innerHTML = '<a href="/foobar">Foo Bar</a>';
          }, 5);
        </script>
      `);

      await expect(Link('Foo Bar').exists()).resolves.toEqual(true);
    });
  });

  describe('actions', () => {
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

      await Link('Foo Bar').click();
      await expect(Header('Hello!').exists()).resolves.toEqual(true);
    });
  });
})
