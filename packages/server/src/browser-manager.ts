import { Operation, resource } from 'effection';
import { spawn } from 'effection';
import { Slice } from '@bigtest/atom';
import { Deferred } from '@bigtest/effection';
import { load, Driver, DriverSpec } from '@bigtest/driver';

import { OrchestratorState } from './orchestrator/state';

interface CreateOptions {
  atom: Slice<OrchestratorState>;
  connectURL(agentId: string): string;
  drivers: Record<string, DriverSpec<unknown>>;
  launch: string[];
}

export interface BrowserManager {
  ready(): Operation<void>;
}

export function* createBrowserManager(options: CreateOptions): Operation<BrowserManager> {

  let ready = Deferred<void>();

  let manager: BrowserManager = {
    *ready() { yield ready.promise }
  };

  return yield resource(manager, function*() {

    for (let launch of options.launch) {
      let driver: Driver = yield load(options.drivers[launch]);
      yield spawn(driver.connect(options.connectURL(launch)));
    }

    for (let launch of options.launch) {
      yield options.atom.once(state => state.agents[launch] != null);
    }

    ready.resolve();

    yield;
  });
}
