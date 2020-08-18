import { OrchestratorState } from './orchestrator/state';
import { Atom } from '@bigtest/atom';
import { Subscribable } from '@effection/subscription';

export interface LoggerOptions {
  atom: Atom<OrchestratorState>;
  out: <A extends unknown[]>(...args: A) => void;
}

export function* createLogger({ atom, out }: LoggerOptions) {
  let bundlerState = atom.slice('bundler');
 
  yield Subscribable.from(bundlerState).forEach(function* (event) {
    if(event.type === 'ERRORED'){
      out("[manifest builder] build error:", event.error);
      if (event.error.frame) {
        out("[manifest builder] build error frame:\n", event.error.frame);
      }
    }
  })
}