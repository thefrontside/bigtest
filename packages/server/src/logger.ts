import { OrchestratorState } from './orchestrator/state';
import { Atom } from '@bigtest/atom';
import { subscribe } from '@effection/subscription';
import { BundlerError } from '@bigtest/bundler';
import { ValidationException } from '@bigtest/eslint-plugin/dist/types';

type Out = <A extends unknown[]>(...args: A) => void;

export interface LoggerOptions {
  atom: Atom<OrchestratorState>;
  out: Out;
}

type PossibleError = BundlerError | ValidationException |  BundlerError | Error;

export const isValidationError = (error: PossibleError): error is ValidationException =>
  error.hasOwnProperty('formattedMessage');

export const outputTagger = (tag: string, out: Out): Out => <A extends unknown[]>(...args: A) => out(tag, ...args);

export function* createLogger({ atom, out }: LoggerOptions) {
  let bundlerState = atom.slice('bundler');

  yield subscribe(bundlerState).forEach(function* (event) {
    if(event.type === 'ERRORED'){
      out("[manifest builder] build error:");
      // TODO: should receive INVALID errors in a new PR
      if(isValidationError(event.error)) {
        out(event.error.formattedMessage);
      } else {
        out(event.error.message);
      }
    }
    if(event.type === 'GREEN'){
      out("[manifest builder] build successful!");
    }
  });
}