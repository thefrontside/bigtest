import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import type { AppServiceStatus, OrchestratorState } from '../src/orchestrator/state';
import type { Atom, Slice } from '@bigtest/atom';
import { createOrchestratorAtom } from '../src/orchestrator/atom';
import { assertStatus } from '../src/assertions/status-assertions';

import { actions } from './helpers';
import { appServer } from '../src/app-server';

describe('app service', () => {
  let atom: Atom<OrchestratorState>;
  let appStatus: Slice<AppServiceStatus, OrchestratorState>;

  describe('ready', () => {
    beforeEach(() => {
      atom = createOrchestratorAtom({ app: {
        url: "http://localhost:24000",
        command: "yarn test:app:start 24000",
      }
    });

      appStatus = atom.slice('appService', 'status');

      actions.fork(function * () {
        yield appServer(appStatus, { atom });
      });
    });

    it("should be transition from 'started' to 'ready'", async () => {
      let appStatus = atom.slice('appService', 'status');

      expect(appStatus.get().type).toBe('started');

      await actions.fork(
        appStatus.once(status => status.type === 'ready')
      );

      expect(appStatus.get().type).toBe('ready');
    });
  });

  describe('exited', () => {
    beforeEach(() => {
      atom = createOrchestratorAtom({ app: {
          url: "http://localhost:24000",
          command: "yarn no:such:command",
        }
      });

      appStatus = atom.slice('appService', 'status');

      actions.fork(function * () {
        yield appServer(appStatus, { atom })
      });
    });

    it('should transition to exited', async () => {
      let appStatus = atom.slice('appService', 'status');

      await actions.fork(
        appStatus.once(status => status.type === 'exited')
      );

      let current = appStatus.get();

      assertStatus(current.type, {is: 'exited'});

      expect(current.exitStatus.code).toBe(1);
    })
  })
})
