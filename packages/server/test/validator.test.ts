import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import * as rmrf from 'rimraf';
import * as fs from 'fs';

import { Mailbox } from '@bigtest/effection';

import { actions } from './helpers';
import { createValidator } from '../src/validator';

const TEST_DIR = "./tmp/manifest-builder"
const SRC_DIR = `${TEST_DIR}/src`
const MANIFEST_PATH = `${SRC_DIR}/manifest.js`

const { mkdir, copyFile } = fs.promises;

describe.only('validator', function() {
  let delegate: Mailbox;

  beforeEach((done) => rmrf(TEST_DIR, done));
  beforeEach(async () => {
    await mkdir(SRC_DIR, { recursive: true });
    await copyFile('./test/fixtures/raw-tree-format.t.js', MANIFEST_PATH);

    delegate = new Mailbox();

    actions.fork(function*() {
      yield createValidator({
        delegate
      });
    });

  });

  describe('running on correct code', () => {
    let event1: { message: string };
    let event2: { message: string };

    beforeEach(async () => {
      await actions.receive(delegate, { status: 'ready' });
      event1 = await actions.receive(delegate, { event: 'update' });
      event2 = await actions.receive(delegate, { event: 'update' });
    });

    it('emits a start event', () => {
      expect(event1.message).toEqual('Starting compilation in watch mode...');
    });

    it('emits a success event', () => {
      expect(event2.message).toEqual('Found 0 errors. Watching for file changes.');
    })

    describe('updating', () => {
      let event3: { message: string };

      beforeEach(async () => {
        await copyFile('./test/fixtures/raw-tree-format.t.js', MANIFEST_PATH);
        event3 = await actions.receive(delegate, { event: 'update' });
      });

      it('emits a success event', () => {
        expect(event3.message).toEqual('Found 0 errors. Watching for file changes.');
      });
    });
  });
});
