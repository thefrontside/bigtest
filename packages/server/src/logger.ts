import { OrchestratorState } from './orchestrator/state';
import { Atom } from '@bigtest/atom';
import { subscribe } from '@effection/subscription';

type Out = <A extends unknown[]>(...args: A) => void;

export interface LoggerOptions {
  atom: Atom<OrchestratorState>;
  out: Out;
}

export const outputTagger = (tag: string, out: Out): Out => <A extends unknown[]>(...args: A) => out(tag, ...args);

export function* createBundlerLogger({ atom, out }: LoggerOptions) {
  let bundlerState = atom.slice('bundler');

  let logger = outputTagger('[manifest builder]', out);

  yield subscribe(bundlerState).forEach(function* (event) {
    switch (event.type) {
      case 'INVALID':
        logger('validation errors:', event.errors);
        break;
      
      case 'ERRORED':
        logger("build error:", event.error);
        if (event.error.frame) {
          logger("build error frame:\n", event.error.frame);
        }
        break;
    }
  });
}
