import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import * as fs from 'fs';
import * as path from 'path';
import * as rmrf from 'rimraf';

import { actions } from './helpers';

import { createManifestGenerator } from '../src/manifest-generator';
import { Mailbox } from '../src/effection/events';

const { mkdir, writeFile, unlink } = fs.promises;

const TEST_DIR = "./tmp/manifest-generator"
const MANIFEST_PATH = "./tmp/manifest-generator/manifest.js"

async function loadManifest() {
  let fullPath = path.resolve(MANIFEST_PATH);
  delete require.cache[fullPath];
  return await import(fullPath);
}

describe('manifest-generator', () => {
  let delegate;

  beforeEach((done) => rmrf(TEST_DIR, done));
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    await writeFile(TEST_DIR + "/test1.t.js", "module.exports = { default: { hello: 'world' }};");
    await writeFile(TEST_DIR + "/test2.t.js", "module.exports = { default: { monkey: 'foo' }};");

    delegate = new Mailbox();

    actions.fork(createManifestGenerator({
      delegate,
      files: [TEST_DIR + "/*.t.{js,ts}"],
      manifestPath: MANIFEST_PATH,
    }));

    await actions.receive(delegate, { status: 'ready' });
  });

  describe('starting', () => {
    let manifest;

    beforeEach(async () => {
      manifest = await loadManifest();
    });

    it('writes the manifest', () => {
      expect(manifest.length).toEqual(2)

      expect(manifest[0].path).toEqual('./tmp/manifest-generator/test1.t.js');
      expect(manifest[1].path).toEqual('./tmp/manifest-generator/test2.t.js');

      expect(manifest[0].test.hello).toEqual('world');
      expect(manifest[1].test.monkey).toEqual('foo');
    });
  });

  describe('adding a test file', () => {
    let manifest;

    beforeEach(async () => {
      await writeFile(TEST_DIR + "/test3.t.js", "module.exports = { default: { third: 'test' } };");
      await actions.receive(delegate, { event: 'update' });
      manifest = await loadManifest();
    });

    it('rewrites the manifest', () => {
      expect(manifest.length).toEqual(3)

      expect(manifest[0].path).toEqual('./tmp/manifest-generator/test1.t.js');
      expect(manifest[1].path).toEqual('./tmp/manifest-generator/test2.t.js');
      expect(manifest[2].path).toEqual('./tmp/manifest-generator/test3.t.js');

      expect(manifest[0].test.hello).toEqual('world');
      expect(manifest[1].test.monkey).toEqual('foo');
      expect(manifest[2].test.third).toEqual('test');
    });
  });

  describe('removing a test file', () => {
    let manifest;

    beforeEach(async () => {
      await unlink(TEST_DIR + "/test2.t.js");
      await actions.receive(delegate, { event: 'update' });
      manifest = await loadManifest();
    });

    it('rewrites the manifest', () => {
      expect(manifest.length).toEqual(1)
      expect(manifest[0].path).toEqual('./tmp/manifest-generator/test1.t.js');
      expect(manifest[0].test.hello).toEqual('world');
    });
  });
});
