import { beforeEach } from 'mocha';
import { bigtestGlobals } from '@bigtest/globals';
import { JSDOM } from 'jsdom';

export function dom(html: string) {
  let jsdom = new JSDOM(`<!doctype html><html><body>${html}</body></html>`, { runScripts: "dangerously" });
  bigtestGlobals.document = jsdom.window.document;
}

beforeEach(() => {
  bigtestGlobals.reset();
  bigtestGlobals.defaultInteractorTimeout = 20;
});

