import { describe, beforeEach, it } from 'mocha';
import expect from 'expect';
import fs from 'fs';
import path from 'path';
import rmrf from 'rimraf';

import { timeout } from 'effection';
import { Test } from '@bigtest/suite';
import { createAtom } from '@bigtest/atom';

import { actions } from './helpers';

import { ManifestGeneratorStatus } from '../src/orchestrator/state';
import { manifestGenerator } from '../src/manifest-generator';

const { mkdir, writeFile, unlink } = fs.promises;
import { join } from 'path';

const TEST_DIR = "./tmp/manifest-generator"
const MANIFEST_PATH = "./tmp/manifest-generator/manifest.js"

async function loadManifest() {
  let fullPath = path.resolve(MANIFEST_PATH);
  delete require.cache[fullPath];
  return await import(fullPath);
}

describe('manifest-generator', () => {
  let status = createAtom({ type: 'pending' } as ManifestGeneratorStatus);

  beforeEach((done) => rmrf(TEST_DIR, done));
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    await writeFile(join(TEST_DIR, "/test1.t.js"), "module.exports = { default: { description: 'hello' }};");
    await writeFile(join(TEST_DIR, "/test2.t.js"), "module.exports = { default: { description: 'monkey' }};");
  });

  describe('watching', () => {
    beforeEach(async() => {
      actions.fork(manifestGenerator({
        status,
        files: [TEST_DIR + "/*.t.{js,ts}"],
        destinationPath: MANIFEST_PATH,
        mode: 'watch',
      }));
    });

    describe('starting', () => {
      let manifest: Test;

      beforeEach(async () => {
        await actions.fork(status.once(({ type }) => type === 'ready'));
        manifest = await loadManifest();
      });

      it('writes the manifest', () => {
        expect(manifest.children.length).toEqual(2)
        expect(manifest.children[0]).toEqual({ path: './tmp/manifest-generator/test1.t.js', description: 'hello' });
        expect(manifest.children[1]).toEqual({ path: './tmp/manifest-generator/test2.t.js', description: 'monkey' });
      });
    });

    describe('adding a test file', () => {
      let manifest: Test;

      beforeEach(async () => {
        await writeFile(join(TEST_DIR, "/test3.t.js"), "module.exports = { default: { description: 'test' } };");
        await actions.fork(status.once(({ type }) => type === 'ready'));
        manifest = await loadManifest();
      });

      it('rewrites the manifest', () => {
        expect(manifest.children.length).toEqual(3)
        expect(manifest.children[0]).toEqual({ path: './tmp/manifest-generator/test1.t.js', description: 'hello' });
        expect(manifest.children[1]).toEqual({ path: './tmp/manifest-generator/test2.t.js', description: 'monkey' });
        expect(manifest.children[2]).toEqual({ path: './tmp/manifest-generator/test3.t.js', description: 'test' });
      });
    });

    describe('removing a test file', () => {
      let manifest: Test;

      beforeEach(async () => {
        await unlink(join(TEST_DIR, "/test2.t.js"));
        await actions.fork(status.once(({ type }) => type === 'ready'));
        manifest = await loadManifest();
      });

      it('rewrites the manifest', () => {
        expect(manifest.children.length).toEqual(1)
        expect(manifest.children[0]).toEqual({ path: './tmp/manifest-generator/test1.t.js', description: 'hello' });
      });
    });
  });

  describe('not watching', () => {
    beforeEach(async() => {
      let status = createAtom({ type: 'pending' } as ManifestGeneratorStatus);

      actions.fork(manifestGenerator({
        status,
        files: [TEST_DIR + "/*.t.{js,ts}"],
        destinationPath: MANIFEST_PATH,
        mode: 'build',
      }));

      await actions.fork(status.once(({ type }) => type === 'ready'));
    });

    describe('starting', () => {
      let manifest: Test;

      beforeEach(async () => {
        manifest = await loadManifest();
      });

      it('writes the manifest', () => {
        expect(manifest.children.length).toEqual(2)
        expect(manifest.children[0]).toEqual({ path: './tmp/manifest-generator/test1.t.js', description: 'hello' });
        expect(manifest.children[1]).toEqual({ path: './tmp/manifest-generator/test2.t.js', description: 'monkey' });
      });
    });

    describe('adding a test file', () => {
      let manifest: Test;

      beforeEach(async () => {
        await writeFile(join(TEST_DIR, "/test3.t.js"), "module.exports = { default: { description: 'test' } };");
        await actions.fork(timeout(200));
        manifest = await loadManifest();
      });

      it('does nothing', () => {
        expect(manifest.children.length).toEqual(2)
        expect(manifest.children[0]).toEqual({ path: './tmp/manifest-generator/test1.t.js', description: 'hello' });
        expect(manifest.children[1]).toEqual({ path: './tmp/manifest-generator/test2.t.js', description: 'monkey' });
      });
    });
  });
});
