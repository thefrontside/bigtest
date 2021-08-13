import { describe, it } from '@effection/mocha';
import { createQueue, sleep, spawn } from 'effection';
import expect from 'expect';
import { createLogger } from '../src/logger';
import { createOrchestratorAtom } from '../src';

describe('logger', () => {
  it('should log bundler events', function*() {
    let queue = createQueue<unknown>();
    let logger: (<A extends unknown[]>(...a: A) => void) = (...args) => queue.send(args);

    let atom = createOrchestratorAtom();

    yield spawn(createLogger({ atom, out: logger }));

    yield sleep(5);

    atom.slice('bundler').update(() => ({ type: 'ERRORED', error: { message: 'blah' } } as any));

    expect(yield queue.expect()).toEqual(["[manifest builder] build error:"]);
    expect(yield queue.expect()).toEqual(["blah"]);
  });
})
