import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import * as fs from 'fs';
import * as path from 'path';
import * as rmrf from 'rimraf';

import { fork, receive, Execution, PatternMatchOptions } from 'effection';

import { actions } from './helpers';

import { createTestFileWatcher } from '../src/test-file-watcher';

const { mkdir, readFile, writeFile, unlink } = fs.promises;

const TEST_DIR = "./tmp/test-file-watcher"
const MANIFEST_PATH = "./tmp/test-file-watcher/manifest.js"

async function awaitReceive(task: Execution, match?: PatternMatchOptions) {
  await actions.fork(function*() {
    return yield receive(task, match);
  });
}

async function loadManifest() {
  let fullPath = path.resolve(MANIFEST_PATH);
  delete require.cache[fullPath];
  return await import(fullPath);
}

describe('test-file-watcher', () => {
  let watcher, orchestrator;

  beforeEach((done) => rmrf(TEST_DIR, done));
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    await writeFile(TEST_DIR + "/test1.t.js", "module.exports = { hello: 'world' };");
    await writeFile(TEST_DIR + "/test2.t.js", "module.exports = { monkey: 'foo' };");

    orchestrator = actions.fork(function*() { yield });

    watcher = actions.fork(createTestFileWatcher(orchestrator, {
      files: [TEST_DIR + "/*.t.{js,ts}"],
      manifestPath: MANIFEST_PATH,
    }));

    await awaitReceive(orchestrator, { ready: "manifest" });
  });

  describe('starting', () => {
    let manifest;

    beforeEach(async () => {
      manifest = await loadManifest();
    });

    it('writes the manifest', () => {
      expect(manifest.length).toEqual(2)

      expect(manifest[0].path).toEqual('./tmp/test-file-watcher/test1.t.js');
      expect(manifest[1].path).toEqual('./tmp/test-file-watcher/test2.t.js');

      expect(manifest[0].test.hello).toEqual('world');
      expect(manifest[1].test.monkey).toEqual('foo');
    });
  });

  describe('adding a test file', () => {
    let manifest;

    beforeEach(async () => {
      await writeFile(TEST_DIR + "/test3.t.js", "module.exports = { third: 'test' };");
      await awaitReceive(orchestrator, { change: "manifest" });
      manifest = await loadManifest();
    });

    it('rewrites the manifest', () => {
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
    let manifest;

    beforeEach(async () => {
      await unlink(TEST_DIR + "/test2.t.js");
      await awaitReceive(orchestrator, { change: "manifest" });
      manifest = await loadManifest();
    });

    it('rewrites the manifest', () => {
      expect(manifest.length).toEqual(1)
      expect(manifest[0].path).toEqual('./tmp/test-file-watcher/test1.t.js');
      expect(manifest[0].test.hello).toEqual('world');
    });
  });
});
