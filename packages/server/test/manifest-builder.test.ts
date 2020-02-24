import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import * as path from 'path';
import * as rmrf from 'rimraf';
import * as fs from 'fs';

import { Mailbox } from '@effection/events';

import { actions } from './helpers';
import { createManifestBuilder } from '../src/manifest-builder';
import { Atom } from '../src/orchestrator/atom';

const TEST_DIR = "./tmp/manifest-builder"
const SRC_DIR = `${TEST_DIR}/src`
const BUILD_DIR = `${TEST_DIR}/build`
const DIST_DIR = `${TEST_DIR}/dist`
const MANIFEST_PATH = `${SRC_DIR}/manifest.js`

const { mkdir, copyFile, readFile } = fs.promises;

describe('manifest builder', () => {
  let atom: Atom;
  let delegate: Mailbox;
  let resultPath: string;

  beforeEach((done) => rmrf(TEST_DIR, done));
  beforeEach(async () => {
    await mkdir(SRC_DIR, { recursive: true });
    await copyFile('./test/fixtures/raw-tree-format.t.js', MANIFEST_PATH);

    atom = new Atom();
    delegate = new Mailbox();

    actions.fork(function*() {
      yield createManifestBuilder({
        delegate,
        atom,
        srcPath: MANIFEST_PATH,
        buildDir: BUILD_DIR,
        distDir: DIST_DIR,
      });
    });

    resultPath = (await actions.receive(delegate, { status: 'ready' })).path;
  });

  describe('retrieving test file manifest from disk', () => {
    let body: string;
    beforeEach(async () => {
      body = await readFile(path.resolve(DIST_DIR, resultPath), 'utf8')
    });

    it('contains the built manifest', () => {
      expect(body).toContain('Signing In');
    });
  });

  describe('reading manifest from state on start', () => {
    it('returns the manifest from the state, stripping out any code', () => {
      expect(atom.get().manifest.fileName).toMatch(/manifest-[0-9a-f]+\.js/);
      expect(atom.get().manifest.description).toEqual('Signing In');

      expect(atom.get().manifest.steps[0].action).toEqual(undefined)
    });
  });

  describe('updating the manifest and then reading it', () => {
    beforeEach(async () => {
      await copyFile('./test/fixtures/empty.t.js', MANIFEST_PATH);
      await actions.receive(delegate, { event: "update" });
    });

    it('returns the updated manifest from the state', () => {
      expect(atom.get().manifest.fileName).toMatch(/manifest-[0-9a-f]+\.js/);
      expect(atom.get().manifest.description).toEqual('An empty test with no steps and no children');
    });
  });
});
