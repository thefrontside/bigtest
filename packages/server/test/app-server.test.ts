import { describe, beforeEach, it } from '@effection/mocha';
import expect from 'expect';
import { spawn } from 'effection';
import type { AppServerStatus } from '../src/orchestrator/state';
import { createAtom, Slice } from '@effection/atom';
import { assertStatus } from '../src/assertions/status-assertions';

import { appServer } from '../src/app-server';

describe('app server', () => {
  let status: Slice<AppServerStatus>;

  beforeEach(function*() {
    status = createAtom({ type: 'pending' } as AppServerStatus);
  });

  describe('ready', () => {
    beforeEach(function*() {
      yield spawn(appServer({
        status,
        url: "http://localhost:24100",
        command: "yarn test:app:start 24100",
      }));
    });

    it("should be transition from 'started' to 'available'", function*() {
      expect(status.get().type).toBe('started');

      yield status.match({ type: 'available' }).expect();

      expect(status.get().type).toBe('available');
    });
  });

  describe('exited', () => {
    beforeEach(function*() {
      yield spawn(appServer({
        status,
        url: "http://localhost:24100",
        command: "yarn no:such:command",
      }));
    });

    it('should transition to exited', function*() {
      yield status.match({ type: 'exited' }).expect();

      let current = status.get();

      assertStatus(current.type, {is: 'exited'});

      expect(current.exitStatus.code).toBe(1);
    })
  })
})
