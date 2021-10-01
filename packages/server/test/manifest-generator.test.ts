import { rmrf } from './helpers';
import { describe, beforeEach, it } from '@effection/mocha';
import expect from 'expect';
import fs from 'fs';
import path from 'path';

import { sleep, spawn } from 'effection';
import { Test } from '@bigtest/suite';
import { createAtom } from '@effection/atom';

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

  beforeEach(function*() {
    yield rmrf(TEST_DIR);
    yield mkdir(TEST_DIR, { recursive: true });
    yield writeFile(join(TEST_DIR, "/test1.t.js"), "module.exports = { default: { description: 'hello' }};");
    yield writeFile(join(TEST_DIR, "/test2.t.js"), "module.exports = { default: { description: 'monkey' }};");
  });

  describe('watching', () => {
    beforeEach(function*() {
      yield spawn(manifestGenerator({
        status,
        files: [TEST_DIR + "/*.t.{js,ts}"],
        destinationPath: MANIFEST_PATH,
        mode: 'watch',
      }));
    });

    describe('starting', () => {
      let manifest: Test;

      beforeEach(function*() {
        yield status.match({ type: 'ready' }).expect();
        manifest = yield loadManifest();
      });

      it('writes the manifest', function*() {
        expect(manifest.children.length).toEqual(2)
        expect(manifest.children[0]).toEqual({ path: './tmp/manifest-generator/test1.t.js', description: 'hello' });
        expect(manifest.children[1]).toEqual({ path: './tmp/manifest-generator/test2.t.js', description: 'monkey' });
      });
    });

    describe('adding a test file', () => {
      let manifest: Test;

      beforeEach(function*() {
        yield writeFile(join(TEST_DIR, "/test3.t.js"), "module.exports = { default: { description: 'test' } };");
        yield status.match({ type: 'ready' }).expect();
        manifest = yield loadManifest();
      });

      it('rewrites the manifest', function*() {
        expect(manifest.children.length).toEqual(3)
        expect(manifest.children[0]).toEqual({ path: './tmp/manifest-generator/test1.t.js', description: 'hello' });
        expect(manifest.children[1]).toEqual({ path: './tmp/manifest-generator/test2.t.js', description: 'monkey' });
        expect(manifest.children[2]).toEqual({ path: './tmp/manifest-generator/test3.t.js', description: 'test' });
      });
    });

    describe('removing a test file', () => {
      let manifest: Test;

      beforeEach(function*() {
        yield unlink(join(TEST_DIR, "/test2.t.js"));
        yield status.match({ type: 'ready' }).expect();
        manifest = yield loadManifest();
      });

      it('rewrites the manifest', function*() {
        expect(manifest.children.length).toEqual(1)
        expect(manifest.children[0]).toEqual({ path: './tmp/manifest-generator/test1.t.js', description: 'hello' });
      });
    });
  });

  describe('not watching', () => {
    beforeEach(function*() {
      let status = createAtom({ type: 'pending' } as ManifestGeneratorStatus);

      yield spawn(manifestGenerator({
        status,
        files: [TEST_DIR + "/*.t.{js,ts}"],
        destinationPath: MANIFEST_PATH,
        mode: 'build',
      }));

      yield status.match({ type: 'ready' }).expect();
    });

    describe('starting', () => {
      let manifest: Test;

      beforeEach(function*() {
        manifest = yield loadManifest();
      });

      it('writes the manifest', function*() {
        expect(manifest.children.length).toEqual(2)
        expect(manifest.children[0]).toEqual({ path: './tmp/manifest-generator/test1.t.js', description: 'hello' });
        expect(manifest.children[1]).toEqual({ path: './tmp/manifest-generator/test2.t.js', description: 'monkey' });
      });
    });

    describe('adding a test file', () => {
      let manifest: Test;

      beforeEach(function*() {
        yield writeFile(join(TEST_DIR, "/test3.t.js"), "module.exports = { default: { description: 'test' } };");
        yield sleep(200);
        manifest = yield loadManifest();
      });

      it('does nothing', function*() {
        expect(manifest.children.length).toEqual(2)
        expect(manifest.children[0]).toEqual({ path: './tmp/manifest-generator/test1.t.js', description: 'hello' });
        expect(manifest.children[1]).toEqual({ path: './tmp/manifest-generator/test2.t.js', description: 'monkey' });
      });
    });
  });
});
