import { Operation, createFuture, Resource, spawn } from 'effection';
import { Slice } from '@effection/atom';
import { importDriver, Driver, DriverSpec } from '@bigtest/driver';

import { OrchestratorState } from './orchestrator/state';

interface CreateOptions {
  atom: Slice<OrchestratorState>;
  connectURL(agentId: string): string;
  drivers: Record<string, DriverSpec>;
  launch: string[];
}

export interface BrowserManager {
  ready(): Operation<void>;
}

export function createBrowserManager(options: CreateOptions): Resource<BrowserManager> {
  return {
    labels: {
      name: "browserManager"
    },
    *init() {
      let ready = createFuture<void>();

      yield spawn(function*() {
        for (let launch of options.launch) {
          let driverConfig = options.drivers[launch];
          let driver: Driver = yield importDriver(driverConfig);
          yield spawn(driver.connect(options.connectURL(launch)));
        }

        for (let launch of options.launch) {
          yield options.atom.filter(state => state.agents[launch] != null).expect();
        }

        ready.produce({ state: 'completed', value: undefined });

        yield;
      });

      return { ready: () => ready.future }
    }
  }
}
