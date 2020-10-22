import { fork } from 'effection';
import { OrchestratorState } from './orchestrator/state';
import { Atom } from '@bigtest/atom';
import { subscribe } from '@effection/subscription';

export interface LoggerOptions {
  atom: Atom<OrchestratorState>;
  out: <A extends unknown[]>(...args: A) => void;
}

export function* createLogger({ atom, out }: LoggerOptions) {
  yield fork(subscribe(atom.slice('bundler')).forEach(function* (event) {
    if(event.type === 'ERRORED'){
      out("[manifest builder] build error:");
      out(event.error.message);
    }
    if(event.type === 'GREEN'){
      out("[manifest builder] build successful!");
    }
  }));

  yield fork(subscribe(atom.slice('appService', 'status')).forEach(function* (status) {
    if(status.type === 'reachable') {
      out("[app] successfully connected to application!");
    }
    if(status.type === 'exited') {
      out(`[app] application has exited with status code ${status.exitStatus.code}`)
    }
  }));
}
