import { describe, beforeEach, it } from 'mocha';
import expect from 'expect';
import type { AppServerStatus } from '../src/orchestrator/state';
import { createAtom, Slice } from '@bigtest/atom';
import { assertStatus } from '../src/assertions/status-assertions';

import { actions } from './helpers';
import { appServer } from '../src/app-server';

describe('app server', () => {
  let status: Slice<AppServerStatus>;

  beforeEach(() => {
    status = createAtom({ type: 'pending' } as AppServerStatus);
  });

  describe('ready', () => {
    beforeEach(() => {
      actions.fork(function * () {
        yield appServer({
          status,
          url: "http://localhost:24100",
          command: "yarn test:app:start 24100",
        });
      });
    });

    it("should be transition from 'started' to 'available'", async () => {
      expect(status.get().type).toBe('started');

      await actions.fork(
        status.once(status => status.type === 'available')
      );

      expect(status.get().type).toBe('available');
    });
  });

  describe('exited', () => {
    beforeEach(() => {
      actions.fork(function * () {
        yield appServer({
          status,
          url: "http://localhost:24100",
          command: "yarn no:such:command",
        })
      });
    });

    it('should transition to exited', async () => {
      await actions.fork(
        status.once(status => status.type === 'exited')
      );

      let current = status.get();

      assertStatus(current.type, {is: 'exited'});

      expect(current.exitStatus.code).toBe(1);
    })
  })
})
