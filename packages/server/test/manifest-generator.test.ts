import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import * as fs from 'fs';
import * as path from 'path';
import * as rmrf from 'rimraf';

import { actions } from './helpers';

import { createManifestGenerator } from '../src/manifest-generator';
import { Mailbox } from '@bigtest/effection';
import { createOrchestratorAtom } from '../src/orchestrator/atom';
import { OrchestratorState, Manifest } from '../src/orchestrator/state';
import { Atom } from '@bigtest/atom';
import { assertBundlerState } from '../src/assertions/bundler-assertions';

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
  let delegate: Mailbox;
  let atom: Atom<OrchestratorState>;

  beforeEach((done) => rmrf(TEST_DIR, done));
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    await writeFile(join(TEST_DIR, "/test1.t.js"), "module.exports = { default: { description: 'hello' }};");
    await writeFile(join(TEST_DIR, "/test2.t.js"), "module.exports = { default: { description: 'monkey' }};");

    delegate = new Mailbox();

    atom = createOrchestratorAtom();

    actions.fork(createManifestGenerator({
      delegate,
      files: [TEST_DIR + "/*.t.{js,ts}"],
      destinationPath: MANIFEST_PATH,
      atom 
    }));

    await actions.receive(delegate, { status: 'ready' });
  });

  describe('starting', () => {
    let manifest: Manifest;

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
    let manifest: Manifest;

    beforeEach(async () => {
      await writeFile(join(TEST_DIR, "/test3.t.js"), "module.exports = { default: { description: 'test' } };");
      await actions.receive(delegate, { event: "update" });
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
    let manifest: Manifest;

    beforeEach(async () => {
      await unlink(join(TEST_DIR, "/test2.t.js"));
      await actions.receive(delegate, { event: 'update' });
      manifest = await loadManifest();
    });

    it('rewrites the manifest', () => {
      expect(manifest.children.length).toEqual(1)
      expect(manifest.children[0]).toEqual({ path: './tmp/manifest-generator/test1.t.js', description: 'hello' });
    });
  });

  describe('no default export', () => {
    let manifest: Manifest;

    beforeEach(async () => {
      await writeFile(path.join(TEST_DIR , "/test4.t.js"), "module.exports.namedExport = { description: 'test' };");
      await actions.receive(delegate, { event: "update" });
      manifest = await loadManifest();
    });

    it('adds errors to the manifest', () => {
      let bundlerState = atom.get().bundler;

      assertBundlerState(bundlerState.type, { is: 'INVALID' });

      expect(manifest.children.length).toEqual(2);
      expect(bundlerState.errors).toHaveLength(1);
      
      let error = bundlerState.errors[0];

      expect(error.message).toBe('Test files must have 1 default export');
      expect(error.fileName).toContain('test4.t.js');
    })
  })
});
