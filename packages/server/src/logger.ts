import { OrchestratorState } from './orchestrator/state';
import { Atom } from '@bigtest/atom';
import { subscribe } from '@effection/subscription';
import { BundlerTypes } from '@bigtest/bundler';

type Out = <A extends unknown[]>(...args: A) => void;

export interface LoggerOptions {
  atom: Atom<OrchestratorState>;
  out: Out;
}

export const outputTagger = (tag: string, out: Out): Out => <A extends unknown[]>(...args: A) => out(tag, ...args);

export function* createLogger({ atom, out }: LoggerOptions) {
  let bundlerState = atom.slice('bundler');

  yield subscribe(bundlerState).forEach(function* (event) {
    if(event.type === 'ERRORED'){
      out("[manifest builder] build error:");
      out(event.error.message);
    }
    if(event.type === 'GREEN'){
      out("[manifest builder] build successful!");
    }
  });
}