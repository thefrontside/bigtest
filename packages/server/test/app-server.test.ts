import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import type { OrchestratorState } from '../src/orchestrator/state';
import type { Atom } from '@bigtest/atom';
import { createOrchestratorAtom } from '../src/orchestrator/atom';
import { assertAppServiceStatus } from '../src/assertions/app-service-assertions';

import { actions } from './helpers';
import { createAppServer } from '../src/app-server';

describe('app service', () => {
  let atom: Atom<OrchestratorState>;

  describe('reachable', () => {
    beforeEach(() => {
      atom = createOrchestratorAtom({ app: {
          url: "http://localhost:24000",
          command: "yarn test:app:start 24000",
        }
      });

      actions.fork(function * () {
        yield createAppServer({ atom })
      });
    });

    it("should be transition from 'started' to 'reachable'", async () => {
      let appStatus = atom.slice('appService', 'status');

      expect(appStatus.get().type).toBe('started');

      await actions.fork(
        appStatus.once(status => status.type === 'reachable')
      );

      expect(appStatus.get().type).toBe('reachable');
    });
  });

  describe('exited', () => {
    beforeEach(() => {
      atom = createOrchestratorAtom({ app: {
          url: "http://localhost:24000",
          command: "yarn no:such:command",
        }
      });

      actions.fork(function * () {
        yield createAppServer({ atom })
      });
    });

    it('should transition to exited', async () => {
      let appStatus = atom.slice('appService', 'status');

      await actions.fork(
        appStatus.once(status => status.type === 'exited')
      );

      let current = appStatus.get();

      assertAppServiceStatus(current.type, { is: 'exited' });

      expect(current.exitStatus.code).toBe(1);
    })
  })
})