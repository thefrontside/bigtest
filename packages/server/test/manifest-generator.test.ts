import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import * as fs from 'fs';
import * as path from 'path';
import * as rmrf from 'rimraf';

import { timeout } from 'effection';
import { Test } from '@bigtest/suite';

import { actions, getTestProjectOptions } from './helpers';

import { manifestGenerator } from '../src/manifest-generator';

const { mkdir, writeFile, unlink } = fs.promises;
import { join } from 'path';
import { createOrchestratorAtom } from '../src/orchestrator/atom';

const TEST_DIR = "./tmp/manifest-generator"
const MANIFEST_PATH = "./tmp/manifest-generator/manifest.js"

async function loadManifest() {
  let fullPath = path.resolve(MANIFEST_PATH);
  delete require.cache[fullPath];
  return await import(fullPath);
}

describe('manifest-generator', () => {
  let atom = createOrchestratorAtom(getTestProjectOptions());
  let manifestGeneratorState = atom.slice('manifestGenerator');

  manifestGeneratorState
  prev => ({
    ...prev,
    options: {
      files: [TEST_DIR + "/*.t.{js,ts}"],
      destinationPath: MANIFEST_PATH,
      mode: 'watch',
    },
  }));

  beforeEach((done) => rmrf(TEST_DIR, done));
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    await writeFile(join(TEST_DIR, "/test1.t.js"), "module.exports = { default: { description: 'hello' }};");
    await writeFile(join(TEST_DIR, "/test2.t.js"), "module.exports = { default: { description: 'monkey' }};");
  });
  
  describe('watching', () => {
    beforeEach(async() => {
      actions.fork(manifestGenerator(manifestGeneratorState));
    });

    describe('starting', () => {
      let manifest: Test;

      beforeEach(async () => {
        await actions.fork(atom.slice('manifestGenerator', 'status').once(({ type }) => type === 'ready'));
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
        await actions.fork(atom.slice('manifestGenerator', 'status').once(({ type }) => type === 'ready'));
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
        await actions.fork(atom.slice('manifestGenerator', 'status').once(({ type }) => type === 'ready'));
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
      let atom = createOrchestratorAtom(getTestProjectOptions());
      let manifestGeneratorState = atom.slice('manifestGenerator');

      manifestGeneratorState.update(prev => ({
        ...prev,
        options: {
          files: [TEST_DIR + "/*.t.{js,ts}"],
          destinationPath: MANIFEST_PATH,
          mode: 'build',
        },
      }));

      actions.fork(manifestGenerator(manifestGeneratorState));

      await actions.fork(atom.slice('manifestGenerator', 'status').once(({ type }) => type === 'ready'));
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
