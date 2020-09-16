import { OrchestratorState, BundlerTypes } from './orchestrator/state';
import { Atom } from '@bigtest/atom';
import { subscribe } from '@effection/subscription';

export interface LoggerOptions {
  atom: Atom<OrchestratorState>;
  out: <A extends unknown[]>(...args: A) => void;
}

export function* createLogger({ atom, out }: LoggerOptions) {
  let bundlerState = atom.slice('bundler');

  let currentBundlerType: BundlerTypes;
  yield subscribe(bundlerState).forEach(function* (event) {
    if(event.type !== currentBundlerType) {
      currentBundlerType = event.type;
      if(event.type === 'ERRORED'){
        out("[manifest builder] build error:");
        out(event.error.message);
      }
      if(event.type === 'GREEN'){
        out("[manifest builder] build successful!");
      }
    }
  })
}
