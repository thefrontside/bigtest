import { describe as suite, beforeEach, it } from '@effection/mocha';
import expect from 'expect';
import path from 'path';
import rmrf from 'rimraf';
import fs from 'fs';

import { spawn } from 'effection';
import { createAtom, Slice } from '@effection/atom';

import { createManifestBuilder, updateSourceMapURL } from '../src/manifest-builder';
import { Manifest, BundlerState } from '../src/orchestrator/state';
import { assertBundlerState } from '../src/assertions/bundler-assertions';

// be nice to windows
const TEST_DIR = path.resolve('tmp', 'manifest-builder');
const SRC_DIR = path.resolve(TEST_DIR, 'src');
const BUILD_DIR = path.resolve(TEST_DIR, 'build');
const DIST_DIR = path.resolve(TEST_DIR, 'dist');
const MANIFEST_PATH = path.resolve(SRC_DIR, 'manifest.js');
const FIXTURES_DIR = path.resolve('test', 'fixtures');

const { mkdir, copyFile, readFile } = fs.promises;

const describe = process.platform === 'win32' ? suite.skip : suite;
describe('manifest builder', () => {
  let manifest: Slice<Manifest>;
  let status: Slice<BundlerState>;
  let resultPath: string;

  beforeEach(function*() {
    this.timeout(30000);

    yield () => ({ perform: (resolve) => rmrf(TEST_DIR, resolve) });
    yield mkdir(SRC_DIR, { recursive: true });
    yield copyFile(path.join(FIXTURES_DIR, 'raw-tree-format.t.js'), MANIFEST_PATH);

    manifest = createAtom({ description: "None", fileName: "<init>", steps: [], assertions: [], children: [] } as Manifest);
    status = createAtom({ type: 'UNBUNDLED' } as BundlerState);

    yield spawn(createManifestBuilder({
      status,
      manifest,
      watch: true,
      srcPath: MANIFEST_PATH,
      buildDir: BUILD_DIR,
      distDir: DIST_DIR,
    }));

    let bundlerState = yield status.filter(({ type }) => type === 'GREEN' || type === 'ERRORED').expect();

    if(bundlerState.type === 'ERRORED') {
      throw new Error(bundlerState.error?.message || 'invalid bundle');
    } else if(bundlerState.type === 'GREEN') {
      resultPath = bundlerState.path;
    }

    status.set({ type: 'BUILDING', warnings: []});
  });

  describe('retrieving test file manifest from disk', () => {
    let body: string;
    beforeEach(function*() {
      body = yield readFile(path.resolve(DIST_DIR, resultPath), 'utf8')
    });

    it('contains the built manifest', function*() {
      expect(body).toContain('Signing In');
    });
  });

  describe('updating the manifest', () => {
    let body: string;

    beforeEach(function*() {
      yield copyFile(path.join(FIXTURES_DIR, 'empty.t.js'), MANIFEST_PATH);

      let bundle = yield status.match({ type: 'GREEN' }).expect();

      resultPath = (!!bundle && bundle.type === 'GREEN' && bundle.path) as string;

      body = yield readFile(path.resolve(DIST_DIR, resultPath), 'utf8')
    });

    it('contains the built manifest', function*() {
      expect(body).toContain('An empty test with no steps and no children');
    });
  });

  describe('reading manifest from state on start', () => {
    it('returns the manifest from the state', function*() {
      expect(manifest.get().fileName).toMatch(/manifest-[0-9a-f]+\.js/);
      expect(manifest.get().description).toEqual('Signing In');
    });
  });

  describe('retreiving and updating the sourceMappingURL', () => {
    let build: string;
    let buildMapURL: string;
    let dist: string;
    let distMapURL: string;

    beforeEach(function*() {
      build = yield readFile(path.resolve(BUILD_DIR, 'manifest.js'), 'utf8');
      buildMapURL = build.split(" ").slice(-1)[0].trim();
      dist = yield readFile(path.resolve(DIST_DIR, resultPath), 'utf8');
      distMapURL = dist.split(" ").slice(-1)[0].trim();
    });

    it('copies over the *.js.map file to dist/', function*() {
      expect(fs.existsSync(path.join(DIST_DIR, `${manifest.get().fileName}.map`))).toBeTruthy();
    });
    it('contains the sourcemapURL at the bottom of the manifest', function*() {
      expect(buildMapURL).toEqual("sourceMappingURL=manifest.js.map");
    });
    it('updates the sourcemapURL of dist manifest with fingerprinted file', function*() {
      expect(distMapURL).toMatch(/manifest-[0-9a-f]+\.js.map/);
    });
  });

  describe('when manifest is generated in a different format', () => {
    let error: Error;
    let emptyFilePath: string;

    beforeEach(function*() {
      emptyFilePath = path.resolve(TEST_DIR, 'empty.t.js');

      yield copyFile(path.join(FIXTURES_DIR, 'empty.t.js'), emptyFilePath);
      yield function* (){
        try {
          yield updateSourceMapURL(emptyFilePath, '');
        } catch(e) {
          error = e.toString();
        }
      };
    });

    it('throws error message when sourcemapURL is not generated at the bottom', function*() {
      expect(error).toMatch(/^Error: Expected a sourcemapping near the end/);
    });
  });

  describe('updating the manifest and then reading it', () => {
    beforeEach(function*() {
      yield copyFile(path.join(FIXTURES_DIR, 'empty.t.js'), MANIFEST_PATH);
      yield status.match({ type: 'GREEN' }).expect();
    });

    it('returns the updated manifest from the state', function*() {
      expect(manifest.get().fileName).toMatch(/manifest-[0-9a-f]+\.js/);
      expect(manifest.get().description).toEqual('An empty test with no steps and no children');
    });
  });

  describe('importing the manifest with an error adds the error to the state', () => {
    beforeEach(function*() {
      yield copyFile(path.join(FIXTURES_DIR, 'exceptions', 'error.t.js'), MANIFEST_PATH);
      yield status.match({ type: 'ERRORED' }).expect();
    });

    it('should update the global state with the error detail', function*() {
      let bundlerState = status.get();

      // this could be a custom expect
      // assert is used to type narrow also and does more than just assert
      assertBundlerState(bundlerState.type, {is: 'ERRORED'})

      let error = bundlerState.error;

      expect(error).toBeInstanceOf(SyntaxError);
    });
  })

  describe('importing the manifest with an error adds the error to the state', () => {
    beforeEach(function*() {
      yield copyFile(path.join(FIXTURES_DIR, 'exceptions', 'throw.t.js'), MANIFEST_PATH);
      yield status.match({ type: 'ERRORED' }).expect();
    });

    it('should update the global state with the error detail', function*() {
      let bundlerState = status.get();
      // this could be a custom expect
      // assert is used to type narrow also and does more than just assert
      assertBundlerState(bundlerState.type, {is: 'ERRORED'})

      let error = bundlerState.error;

      expect(error.message).toEqual('bork')
    });
  })
});
