import { Operation, spawn } from 'effection';
import { OrchestratorState } from './orchestrator/state';
import { Slice } from '@effection/atom';

export interface LoggerOptions {
  atom: Slice<OrchestratorState>;
  out: <A extends unknown[]>(...args: A) => void;
}

export function* createLogger({ atom, out }: LoggerOptions): Operation<void> {
  yield spawn(atom.slice('bundler').forEach((event) => {
    if(event.type === 'ERRORED'){
      out("[manifest builder] build error:");
      out(event.error.message);
    }
    if(event.type === 'GREEN'){
      out("[manifest builder] build successful!");
    }
  }));

  yield spawn(atom.slice('appServer').forEach((status) => {
    if(status.type === 'available') {
      out("[app] successfully connected to application!");
    }
    if(status.type === 'exited') {
      out(`[app] application has exited with status code ${status.exitStatus.code}`)
    }
  }));

  yield;
}
