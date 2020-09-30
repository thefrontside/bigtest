import { OrchestratorState } from './orchestrator/state';
import { Atom } from '@bigtest/atom';
import { subscribe } from '@effection/subscription';
import { Reporter } from '@bigtest/reporter';

export interface LoggerOptions {
  atom: Atom<OrchestratorState>;
  reporter: Reporter;
}

export function* createLogger({ atom, reporter }: LoggerOptions) {
  let bundlerState = atom.slice('bundler');

  yield subscribe(bundlerState).forEach(function* (event) {
    if(event.type === 'ERRORED'){
      reporter.clear();
      reporter.error("build error:");
      reporter.error(event.error);
    }
    if(event.type === 'GREEN') {
      reporter.success("build successful!");
    }
  })
}
