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
  defaultLocator: (element) => element.innerText
});

function dom(html: string) {
  let jsdom = new JSDOM(html);
  setDefaultOptions({
    document: jsdom.window.document,
    timeout: 20,
  });
}

describe('@bigtest/interactor', () => {
  describe('.exists', () => {
    it('can determine whether an element exists based on the interactor', () => {
      dom(`
        <p><a href="/foobar">Foo Bar</a></p>
      `);

      expect(Link('Foo Bar').exists()).resolves.toEqual(true);
      expect(Link('Blah').exists()).rejects.toHaveProperty('message', 'link "Blah" does not exist');
    });

    it('can wait for condition to become true', () => {
      dom(`
        <p id="foo"></p>
        <script>
          setTimeout(() => {
            foo.innerHTML = '<a href="/foobar">Foo Bar</a>';
          }, 5);
        </script>
      `);

      expect(Link('Foo Bar').exists()).resolves.toEqual(true);
    });
  });
})
