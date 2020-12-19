import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import type { AppServiceStatus, OrchestratorState, ServiceState, AppOptions } from '../src/orchestrator/state';
import type { Slice } from '@bigtest/atom';
import { createOrchestratorAtom } from '../src/orchestrator/atom';
import { assertStatus } from '../src/assertions/status-assertions';

import { actions, getTestProjectOptions } from './helpers';
import { appServer } from '../src/app-server';

describe('app service', () => {
  let atom: Slice<OrchestratorState>;
  let appStatus: Slice<ServiceState<AppServiceStatus, AppOptions>>;

  describe('ready', () => {
    beforeEach(() => {
      atom = createOrchestratorAtom(getTestProjectOptions());

      appStatus = atom.slice('appService');

      actions.fork(function * () {
        yield appServer(appStatus);
      });
    });

    it("should be transition from 'started' to 'available'", async () => {
      let appStatus = atom.slice('appService', 'status');

      expect(appStatus.get().type).toBe('started');

      await actions.fork(
        appStatus.once(status => status.type === 'available')
      );

      expect(appStatus.get().type).toBe('available');
    });
  });

  describe('exited', () => {
    beforeEach(() => {
      atom = createOrchestratorAtom(getTestProjectOptions({
        app: {
          command: "yarn no:such:command",
        }
      }));

      appStatus = atom.slice('appService');

      actions.fork(function * () {
        yield appServer(appStatus)
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
