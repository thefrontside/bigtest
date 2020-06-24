import { describe, it } from 'mocha';
import * as expect from 'expect'
import { JSDOM } from 'jsdom';

import { bigtestGlobals } from '../src/index';

function makeDocument(): Document {
  return new JSDOM(`<!doctype html><html></html>`).window.document;
}

describe('@bigtest/globals', () => {
  beforeEach(() => {
    delete globalThis.__bigtestManifest;
    delete globalThis.__bigtest;
    delete globalThis.document;
  });

  describe('manifest', () => {
    it('returns an empty manifest by default', () => {
      expect(bigtestGlobals.manifest.description).toEqual('Empty');
    });

    it('returns the global manifest', () => {
      globalThis.__bigtestManifest = {
        description: 'foo',
        steps: [],
        assertions: [],
        children: [],
      }

      expect(bigtestGlobals.manifest.description).toEqual('foo');
    });

    it('can set manifest', () => {
      bigtestGlobals.manifest = {
        description: 'foo',
        steps: [],
        assertions: [],
        children: [],
      };

      expect(bigtestGlobals.manifest.description).toEqual('foo');
    });
  });

  describe('document', () => {
    it('throws an error if there is no document', () => {
      expect(() => bigtestGlobals.document).toThrow('no document found');
    });

    it('returns the current document by default', () => {
      let globalDocument = makeDocument();
      globalThis.document = globalDocument;
      expect(bigtestGlobals.document).toEqual(globalDocument);
    });

    it('can assign a document', () => {
      let myDocument = makeDocument();
      bigtestGlobals.document = myDocument;
      expect(bigtestGlobals.document).toEqual(myDocument);
    });
  });

  describe('defaultInteractorTimeout', () => {
    it('returns 1900 by default', () => {
      expect(bigtestGlobals.defaultInteractorTimeout).toEqual(1900);
    });

    it('can assign a number', () => {
      bigtestGlobals.defaultInteractorTimeout = 3000;
      expect(bigtestGlobals.defaultInteractorTimeout).toEqual(3000);
    });
  });
})
