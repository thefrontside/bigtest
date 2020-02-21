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

const { mkdir, writeFile, readFile } = fs.promises;

describe('manifest builder', () => {
  let atom: Atom;
  let delegate: Mailbox;
  let resultPath: string;

  beforeEach((done) => rmrf(TEST_DIR, done));
  beforeEach(async () => {
    await mkdir(SRC_DIR, { recursive: true });
    await writeFile(MANIFEST_PATH, "module.exports = { sources: [ 'boo' ] };");

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
      expect(body).toContain('boo');
    });
  });

  describe('reading manifest from state on start', () => {
    it('returns the manifest from the state', () => {
      let { manifest: { sources: [ first ] } } = atom.get() ;
      expect(first).toEqual('boo');
    });
  });

  describe('updating the manifest and then reading it', () => {
    beforeEach(async () => {
      await writeFile(MANIFEST_PATH, "module.exports = { sources: ['foo' ] };");
      await actions.receive(delegate, { event: "update" });
    });

    it('returns the updated manifest from the state', () => {
      expect(atom.get().manifest.sources).toEqual(['foo']);
    });
  });
});
