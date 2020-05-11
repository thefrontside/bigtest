import { Operation, resource } from 'effection';
import { spawn } from 'effection';
import { Atom } from '@bigtest/atom';
import { Deferred } from '@bigtest/effection';
import { Local, Options as WebDriverOptions, WebDriver } from '@bigtest/webdriver';

import { OrchestratorState } from './orchestrator/state';

interface CreateOptions {
  atom: Atom<OrchestratorState>;
  connectURL(agentId: string): string;
  drivers: Record<string, WebDriverOptions>;
  launch: string[];
}

export interface BrowserManager {
  ready(): Operation<void>;
}

export function* createBrowserManager(options: CreateOptions): Operation<BrowserManager> {

  let ready = Deferred<void>();

  let manager: BrowserManager = {
    *ready() { yield ready.promise; }
  }

  return yield resource(manager, function*() {

    for (let launch of options.launch) {
      let driver: WebDriver = yield Local(options.drivers[launch]);
      yield spawn(driver.navigateTo(options.connectURL(launch)));
    }

    for (let launch of options.launch) {
      yield options.atom.once(state => state.agents[launch] != null)
    }

    ready.resolve();

    yield;
  })
}
