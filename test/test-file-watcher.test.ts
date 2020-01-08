import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import * as fs from 'fs';
import * as path from 'path';
import * as rmrf from 'rimraf';

import { fork } from 'effection';

import { actions } from './helpers';

import { createTestFileWatcher } from '../src/test-file-watcher';

const { mkdir, readFile, writeFile, unlink } = fs.promises;

const TEST_DIR = "./tmp/test-file-watcher"
const MANIFEST_PATH = "./tmp/test-file-watcher/manifest.js"

function awaitEvent(eventSource, eventName) {
  return new Promise((resolve) => eventSource.once(eventName, resolve));
}

async function loadManifest() {
  let fullPath = path.resolve(MANIFEST_PATH);
  delete require.cache[fullPath];
  return await import(fullPath);
}

describe('test-file-watcher', () => {
  let watcher;

  beforeEach((done) => rmrf(TEST_DIR, done));
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    await writeFile(TEST_DIR + "/test1.t.js", "module.exports = { hello: 'world' };");
    await writeFile(TEST_DIR + "/test2.t.js", "module.exports = { monkey: 'foo' };");

    watcher = actions.fork(createTestFileWatcher(null, {
      files: [TEST_DIR + "/*.t.{js,ts}"],
      manifestPath: MANIFEST_PATH,
    }));
  });

  describe('starting', () => {
    it('writes the manifest', async () => {
      await awaitEvent(watcher, "ready");

      let manifest = await loadManifest();

      expect(manifest.length).toEqual(2)

      expect(manifest[0].path).toEqual('./tmp/test-file-watcher/test1.t.js');
      expect(manifest[1].path).toEqual('./tmp/test-file-watcher/test2.t.js');

      expect(manifest[0].test.hello).toEqual('world');
      expect(manifest[1].test.monkey).toEqual('foo');
    });
  });

  describe('adding a test file', () => {
    it('rewrites the manifest', async () => {
      await awaitEvent(watcher, "ready");

      await Promise.all([
        awaitEvent(watcher, "change"),
        writeFile(TEST_DIR + "/test3.t.js", "module.exports = { third: 'test' };"),
      ]);

      let manifest = await loadManifest();

      expect(manifest.length).toEqual(3)

      expect(manifest[0].path).toEqual('./tmp/test-file-watcher/test1.t.js');
      expect(manifest[1].path).toEqual('./tmp/test-file-watcher/test2.t.js');
      expect(manifest[2].path).toEqual('./tmp/test-file-watcher/test3.t.js');

      expect(manifest[0].test.hello).toEqual('world');
      expect(manifest[1].test.monkey).toEqual('foo');
      expect(manifest[2].test.third).toEqual('test');
    });
  });

  describe('removing a test file', () => {
    it('rewrites the manifest', async () => {
      await awaitEvent(watcher, "ready");

      await Promise.all([
        awaitEvent(watcher, "change"),
        unlink(TEST_DIR + "/test2.t.js"),
      ]);

      let manifest = await loadManifest();

      expect(manifest.length).toEqual(1)
      expect(manifest[0].path).toEqual('./tmp/test-file-watcher/test1.t.js');
      expect(manifest[0].test.hello).toEqual('world');
    });
  });
});
