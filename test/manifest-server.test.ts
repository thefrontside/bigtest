import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import * as rmrf from 'rimraf';
import * as fs from 'fs';

import { Response } from 'node-fetch';
import { Context } from 'effection';
import { Mailbox } from '@effection/events';

import { actions } from './helpers';
import { createManifestServer } from '../src/manifest-server';
import { OrchestratorState } from '../src/orchestrator/state';
import { Atom } from '../src/orchestrator/atom';

const TEST_DIR = "./tmp/manifest-server"
const MANIFEST_PATH = "./tmp/manifest-server/manifest.js"

const { mkdir, writeFile } = fs.promises;

let TEST_FILE_PORT = 24200;

describe('manifest server', () => {
  let atom: Atom;
  let delegate: Mailbox;

  beforeEach((done) => rmrf(TEST_DIR, done));
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    await writeFile(MANIFEST_PATH, "module.exports = { sources: [ 'boo' ] };");

    atom = new Atom();
    delegate = new Mailbox();

    actions.fork(function*() {
      yield createManifestServer({
        delegate,
        atom,
        manifestPath: MANIFEST_PATH,
        port: TEST_FILE_PORT
      });
    });

    await actions.receive(delegate, { status: 'ready' });
  });

  describe('retrieving test file manifest', () => {
    let response: Response;
    let body: string;
    beforeEach(async () => {
      response = await actions.fetch(`http://localhost:${TEST_FILE_PORT}/manifest.js`);
      body = await response.text();
    });

    it('responds successfully', () => {
      expect(response.ok).toEqual(true);
    });

    it('serves the manifest', () => {
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
