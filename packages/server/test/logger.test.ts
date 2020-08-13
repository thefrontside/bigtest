import { describe, it } from 'mocha';
import * as expect from 'expect';
import { actions } from './helpers';
import { createLogger } from '../src/logger';
import { createOrchestratorAtom } from '../src';
import { OrchestratorState } from '../src/orchestrator/state';
import { Atom } from '@bigtest/atom/dist';

describe('logger', () => {
  it('should log bundler events', async () => {
    let atom: Atom<OrchestratorState>;
    let logger:  (<A extends unknown[]>(...a: A) => void) = (...args) => {
      expect(args).toEqual(["[manifest builder] build error:", "blah"]);
    };

    atom = createOrchestratorAtom();
    
    actions.fork(createLogger({ atom, out: logger }));
    
    atom.slice('bundler').update(() => ({ status: 'errored', error: 'blah' } as any));
  });
})
