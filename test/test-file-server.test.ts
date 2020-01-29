import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import * as rmrf from 'rimraf';
import * as fs from 'fs';

import { Response } from 'node-fetch';
import { Context } from 'effection';

import { actions } from './helpers';
import { createTestFileServer } from '../src/test-file-server';
import { atom, OrchestratorState } from '../src/orchestrator/state';

const TEST_DIR = "./tmp/test-file-server"
const MANIFEST_PATH = "./tmp/test-file-server/manifest.js"

const { mkdir, writeFile } = fs.promises;

let TEST_FILE_PORT = 24200;

describe('test file server', () => {
  let orchestrator: Context;

  beforeEach((done) => rmrf(TEST_DIR, done));
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    await writeFile(MANIFEST_PATH, "module.exports = [{ path: 'someworld', test: 123 }];");

    orchestrator = actions.fork(function*() { yield });

    actions.fork(function*() {
      yield createTestFileServer(orchestrator, {
        manifestPath: MANIFEST_PATH,
        port: TEST_FILE_PORT
      });
    });

    await actions.receive(orchestrator, { ready: "test-files" });
  });

  describe('retrieving test file manifest', () => {
    let response: Response;
    let body: string;
    beforeEach(async () => {
      response = await actions.get(`http://localhost:${TEST_FILE_PORT}/manifest.js`);
      body = await response.text();
    });

    it('responds successfully', () => {
      expect(response.ok).toEqual(true);
    });

    it('serves the manifest', () => {
      expect(body).toContain('someworld');
    });
  });

  describe('reading manifest from state on start', () => {
    let state: OrchestratorState;
    beforeEach(async () => {
      state = await actions.fork(atom.get());
    });

    it('returns the manifest from the state', () => {
      let { manifest: [ first ] } = state;
      expect(first).toEqual({ path: 'someworld', test: 123 });
    });
  });

  describe('updating the manifest and then reading it', () => {
    let state: OrchestratorState;
    beforeEach(async () => {
      await writeFile(MANIFEST_PATH, "module.exports = [{ path: 'boo', test: 432 }];");
      await actions.receive(orchestrator, { update: "test-files" });
      state = await actions.fork(atom.get());
    });

    it('returns the updated manifest from the state', () => {
      expect(state.manifest[0]).toEqual({ path: 'boo', test: 432 });
    });
  });
});
