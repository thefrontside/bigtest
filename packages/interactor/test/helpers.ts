import { beforeEach } from 'mocha';
import { bigtestGlobals } from '@bigtest/globals';
import { DOMWindow, JSDOM } from 'jsdom';

let jsdom: JSDOM;

export function dom(html: string): DOMWindow {
  jsdom = new JSDOM(`<!doctype html><html><body>${html}</body></html>`, { runScripts: "dangerously" });

  // Because JSDOM does not have any concept of flow or layout, it cannot actually implement
  // `innerText` correctly, so they have opted not to implement it at all. So, to make things
  // work we just alias `.innerText` to `.textContent` for all `HTMLElement` subtypes.
  // Long term, the solution is to have interactors actually run inside the bigtest runner
  // against multiple browsers.
  //
  // See details: https://github.com/jsdom/jsdom/issues/1245
  Object.defineProperty(jsdom.window.HTMLElement.prototype, 'innerText', {
    get() {
      return this.textContent || '';
    }
  });
  bigtestGlobals.document = jsdom.window.document;

  return jsdom.window;
}

beforeEach(() => {
  bigtestGlobals.reset();
  bigtestGlobals.defaultInteractorTimeout = 20;
});

afterEach(() => {
  jsdom?.window?.close();
});
