import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import * as path from 'path';
import * as rmrf from 'rimraf';
import * as fs from 'fs';

import { Mailbox } from '@bigtest/effection';
import { Atom } from '@bigtest/atom';

import { actions } from './helpers';
import { createManifestBuilder, updateSourceMapURL } from '../src/manifest-builder';
import { createOrchestratorAtom } from '../src/orchestrator/atom';
import { OrchestratorState } from '../src/orchestrator/state';

const TEST_DIR = "./tmp/manifest-builder"
const SRC_DIR = `${TEST_DIR}/src`
const BUILD_DIR = `${TEST_DIR}/build`
const DIST_DIR = `${TEST_DIR}/dist`
const MANIFEST_PATH = `${SRC_DIR}/manifest.js`

const { mkdir, copyFile, readFile } = fs.promises;

describe('manifest builder', () => {
  let atom: Atom<OrchestratorState>;
  let delegate: Mailbox;
  let resultPath: string;

  beforeEach((done) => rmrf(TEST_DIR, done));
  beforeEach(async () => {
    await mkdir(SRC_DIR, { recursive: true });
    await copyFile('./test/fixtures/raw-tree-format.t.js', MANIFEST_PATH);

    atom = createOrchestratorAtom();
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

    resultPath = (await actions.receive(delegate, { status: 'ready' }))['path'];
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
    it('returns the manifest from the state', () => {
      expect(atom.get().manifest.fileName).toMatch(/manifest-[0-9a-f]+\.js/);
      expect(atom.get().manifest.description).toEqual('Signing In');
    });
  });

  describe('retreiving and updating the sourceMappingURL', () => {
    let build: string;
    let buildMapURL: string;
    let dist: string;
    let distMapURL: string;

    beforeEach(async () => {
      build = await readFile(path.resolve(BUILD_DIR, 'manifest.js'), 'utf8');
      buildMapURL = build.split(" ").slice(-1)[0];
      dist = await readFile(path.resolve(DIST_DIR, resultPath), 'utf8');
      distMapURL = dist.split(" ").slice(-1)[0];
    });

    it('copies over the *.js.map file to dist/', () => {
      expect(fs.existsSync(`${DIST_DIR}/${atom.get().manifest.fileName}.map`)).toBeTruthy();
    });
    it('contains the sourcemapURL at the bottom of the manifest', () => {
      expect(buildMapURL).toEqual("sourceMappingURL=/manifest.js.map");
    });
    it('updates the sourcemapURL of dist manifest with fingerprinted file', () => {
      expect(distMapURL).toMatch(/manifest-[0-9a-f]+\.js.map/);
    });
  });
  
  describe('when manifest is generated in a different format', () => {
    let error: Error;
    let emptyFilePath: string;

    beforeEach(async () => {
      emptyFilePath = `${TEST_DIR}/empty.t.js`;

      await copyFile('./test/fixtures/empty.t.js', emptyFilePath);
      await actions.fork(function* (){
        try {
          yield updateSourceMapURL(emptyFilePath, '');
        } catch(e) {
          error = e.toString();
        }
      });
    });

    it('throws error message when sourcemapURL is not generated at the bottom', async () => {
      expect(error).toMatch(/^Error: Expected a sourcemapping near the end/);
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
