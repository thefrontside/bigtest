import { beforeEach } from 'mocha';
import { bigtestGlobals } from '@bigtest/globals';
import { JSDOM } from 'jsdom';

let jsdom: JSDOM;

export function dom(html: string) {
  jsdom = new JSDOM(`<!doctype html><html><body>${html}</body></html>`, { runScripts: "dangerously" });
  bigtestGlobals.document = jsdom.window.document;
}

beforeEach(() => {
  bigtestGlobals.reset();
  bigtestGlobals.defaultInteractorTimeout = 20;
});

afterEach(() => {
  jsdom?.window?.close();
});
