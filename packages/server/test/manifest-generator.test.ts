import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import * as fs from 'fs';
import * as path from 'path';
import * as rmrf from 'rimraf';

import { actions } from './helpers';

import { Manifest } from '../src/test';
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
    await writeFile(TEST_DIR + "/test1.t.js", "module.exports = { default: { description: 'hello' }};");
    await writeFile(TEST_DIR + "/test2.t.js", "module.exports = { default: { description: 'monkey' }};");

    delegate = new Mailbox();

    actions.fork(createManifestGenerator({
      delegate,
      files: [TEST_DIR + "/*.t.{js,ts}"],
      destinationPath: MANIFEST_PATH,
    }));

    await actions.receive(delegate, { status: 'ready' });
  });

  describe('starting', () => {
    let manifest: Manifest;

    beforeEach(async () => {
      manifest = await loadManifest();
    });

    it('writes the manifest', () => {
      expect(manifest.sources.length).toEqual(2)

      expect(manifest.sources).toEqual([
        './tmp/manifest-generator/test1.t.js',
        './tmp/manifest-generator/test2.t.js'
      ]);

      let [one, two] = manifest.suite.children;
      expect(one.description).toEqual('hello');
      expect(two.description).toEqual('monkey');
    });
  });

  describe('adding a test file', () => {
    let manifest: Manifest;

    beforeEach(async () => {
      await writeFile(TEST_DIR + "/test3.t.js", "module.exports = { default: { description: 'test' } };");
      await actions.receive(delegate, { event: "update" });
      manifest = await loadManifest();
    });

    it('rewrites the manifest', () => {
      expect(manifest.sources.length).toEqual(3)

      let [first, second, third] = manifest.sources;
      expect(first).toEqual('./tmp/manifest-generator/test1.t.js');
      expect(second).toEqual('./tmp/manifest-generator/test2.t.js');
      expect(third).toEqual('./tmp/manifest-generator/test3.t.js');

      expect([...manifest.suite.children]).toMatchObject([
        { description: 'hello' },
        { description: 'monkey' },
        { description: 'test' }
      ]);
    });
  });

  describe('removing a test file', () => {
    let manifest: Manifest;

    beforeEach(async () => {
      await unlink(TEST_DIR + "/test2.t.js");
      await actions.receive(delegate, { event: 'update' });
      manifest = await loadManifest();
    });

    it('rewrites the manifest', () => {
      let [file1, file2] = manifest.sources;
      expect(file2).toBeUndefined();
      expect(file1).toEqual('./tmp/manifest-generator/test1.t.js');
      let [test] = manifest.suite.children;
      expect(test.description).toEqual('hello');
    });
  });
});
