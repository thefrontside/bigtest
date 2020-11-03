import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import * as path from 'path';
import * as rmrf from 'rimraf';
import * as fs from 'fs';

import { Atom } from '@bigtest/atom';

import { actions, getTestProjectOptions } from './helpers';
import { createManifestBuilder, updateSourceMapURL } from '../src/manifest-builder';
import { createOrchestratorAtom } from '../src/orchestrator/atom';
import { OrchestratorState } from '../src/orchestrator/state';
import { assertBundlerState } from '../src/assertions/bundler-assertions';

// be nice to windows
const TEST_DIR = path.resolve('tmp', 'manifest-builder');
const SRC_DIR = path.resolve(TEST_DIR, 'src');
const BUILD_DIR = path.resolve(TEST_DIR, 'build');
const DIST_DIR = path.resolve(TEST_DIR, 'dist');
const MANIFEST_PATH = path.resolve(SRC_DIR, 'manifest.js');
const FIXTURES_DIR = path.resolve('test', 'fixtures');

const { mkdir, copyFile, readFile } = fs.promises;

describe('manifest builder', () => {
  let atom: Atom<OrchestratorState>;
  let resultPath: string;

  beforeEach((done) => rmrf(TEST_DIR, done));
  beforeEach(async () => {
    await mkdir(SRC_DIR, { recursive: true });
    await copyFile(path.join(FIXTURES_DIR, 'raw-tree-format.t.js'), MANIFEST_PATH);

    atom = createOrchestratorAtom(getTestProjectOptions());

    actions.fork(function*() {
      yield createManifestBuilder({
        atom,
        watch: true,
        srcPath: MANIFEST_PATH,
        buildDir: BUILD_DIR,
        distDir: DIST_DIR,
      });
    });

    let bundlerState = await actions.fork(atom.slice('bundler').once(({ type }) => type === 'GREEN'));

    resultPath = (bundlerState?.type === 'GREEN' && bundlerState.path) as string;

    atom.slice('bundler').update(() => ({ type: 'BUILDING', warnings: []}));
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

  describe('updating the manifest', () => {
    let body: string;

    beforeEach(async () => {
      await copyFile(path.join(FIXTURES_DIR, 'empty.t.js'), MANIFEST_PATH);

      let bundle = await actions.fork(atom.slice('bundler').once(({ type }) => type === 'GREEN'));

      resultPath = (!!bundle && bundle.type === 'GREEN' && bundle.path) as string;

      body = await readFile(path.resolve(DIST_DIR, resultPath), 'utf8')
    });

    it('contains the built manifest', () => {
      expect(body).toContain('An empty test with no steps and no children');
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
      buildMapURL = build.split(" ").slice(-1)[0].trim();
      dist = await readFile(path.resolve(DIST_DIR, resultPath), 'utf8');
      distMapURL = dist.split(" ").slice(-1)[0].trim();
    });

    it('copies over the *.js.map file to dist/', () => {
      expect(fs.existsSync(path.join(DIST_DIR, `${atom.get().manifest.fileName}.map`))).toBeTruthy();
    });
    it('contains the sourcemapURL at the bottom of the manifest', () => {
      expect(buildMapURL).toEqual("sourceMappingURL=manifest.js.map");
    });
    it('updates the sourcemapURL of dist manifest with fingerprinted file', () => {
      expect(distMapURL).toMatch(/manifest-[0-9a-f]+\.js.map/);
    });
  });

  describe('when manifest is generated in a different format', () => {
    let error: Error;
    let emptyFilePath: string;

    beforeEach(async () => {
      emptyFilePath = path.resolve(TEST_DIR, 'empty.t.js');

      await copyFile(path.join(FIXTURES_DIR, 'empty.t.js'), emptyFilePath);
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
      await copyFile(path.join(FIXTURES_DIR, 'empty.t.js'), MANIFEST_PATH);
      await actions.fork(atom.slice('bundler').once(({ type }) => type === 'GREEN'))
    });

    it('returns the updated manifest from the state', () => {
      expect(atom.get().manifest.fileName).toMatch(/manifest-[0-9a-f]+\.js/);
      expect(atom.get().manifest.description).toEqual('An empty test with no steps and no children');
    });
  });

  describe('importing the manifest with an error adds the error to the state', () => {
    beforeEach(async () => {
      await copyFile(path.join(FIXTURES_DIR, 'exceptions', 'error.t.js'), MANIFEST_PATH);
      await actions.fork(atom.slice('bundler').once(({ type }) => type === 'ERRORED'));
    });

    it('should update the global state with the error detail', () => {
      let bundlerState = atom.get().bundler;

      // this could be a custom expect
      // assert is used to type narrow also and does more than just assert
      assertBundlerState(bundlerState.type, {is: 'ERRORED'})

      let error = bundlerState.error;

      expect(error.frame).toBeTruthy();
    });
  })

  describe('importing the manifest with an error adds the error to the state', () => {
    beforeEach(async () => {
      await copyFile(path.join(FIXTURES_DIR, 'exceptions', 'throw.t.js'), MANIFEST_PATH);
      await actions.fork(atom.slice('bundler').once(({ type }) => type === 'ERRORED'));
    });

    it('should update the global state with the error detail', () => {
      let bundlerState = atom.get().bundler;

      // this could be a custom expect
      // assert is used to type narrow also and does more than just assert
      assertBundlerState(bundlerState.type, {is: 'ERRORED'})

      let error = bundlerState.error;

      expect(error.message).toEqual('bork')
    });
  })
});
