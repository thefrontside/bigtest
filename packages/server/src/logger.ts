import { Context, fork, Operation } from 'effection';
import { OrchestratorState } from './orchestrator/state';
import { Slice } from '@bigtest/atom';
import { subscribe } from '@effection/subscription';

export interface LoggerOptions {
  atom: Slice<OrchestratorState>;
  out: <A extends unknown[]>(...args: A) => void;
}

export function* createLogger({ atom, out }: LoggerOptions): Generator<Operation<Context<undefined>>> {
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
    if(status.type === 'available') {
      out("[app] successfully connected to application!");
    }
    if(status.type === 'exited') {
      out(`[app] application has exited with status code ${status.exitStatus.code}`)
    }
  }));
}
