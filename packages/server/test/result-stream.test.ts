import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';

import { ChainableSubscription } from '@effection/subscription';

import { Atom, Slice } from '@bigtest/atom';

import { resultStream } from '../src/result-stream';
import { createOrchestratorAtom } from '../src/orchestrator/atom';
import { OrchestratorState, TestRunState } from '../src/orchestrator/state';
import { TestEvent } from '../src/schema/test-event';

import { actions, getTestProjectOptions } from './helpers';

describe('result stream', () => {
  let atom: Atom<OrchestratorState>;
  let slice: Slice<TestRunState>;
  let subscription: ChainableSubscription<TestEvent, void>;

  beforeEach(async () => {
    atom = createOrchestratorAtom(getTestProjectOptions());
    slice = atom.slice('testRuns').slice('test-run-1');
    slice.set({
      testRunId: 'test-run-1',
      status: 'pending',
      agents: {
        "agent-1": {
          status: 'pending',
          agent: { agentId: 'agent-1' },
          result: {
            description: 'some test',
            status: 'pending',
            steps: [
              { description: 'step one', status: 'pending' },
              { description: 'step two', status: 'pending' }
            ],
            assertions: [
              { description: 'assertion one', status: 'pending' },
              { description: 'assertion two', status: 'pending' }
            ],
            children: [
              {
                description: 'another test',
                status: 'pending',
                steps: [
                  { description: 'a child step', status: 'pending' }
                ],
                assertions: [
                  { description: 'a child assertion', status: 'pending' }
                ],
                children: []
              }
            ]
          }
        }
      }
    });

    subscription = await actions.fork(resultStream('test-run-1', slice));
  });

  describe('steps', () => {
    describe('marking a step as running', () => {
      beforeEach(() => {
        slice.slice('agents', 'agent-1', 'result', 'steps', 0, 'status').set('running');
      });

      it('generates a test event', async () => {
        let { value } = await actions.fork(subscription.next());
        expect(value).toMatchObject({
          type: 'step:running',
          agentId: 'agent-1',
          testRunId: 'test-run-1',
          path: ['some test', '0:step one'],
        });
      });
    });

    describe('marking a step as ok', () => {
      beforeEach(() => {
        slice.slice('agents', 'agent-1', 'result', 'steps', 0, 'status').set('ok');
      });

      it('generates a test event', async () => {
        let { value } = await actions.fork(subscription.next());
        expect(value).toMatchObject({
          type: 'step:result',
          status: 'ok',
          agentId: 'agent-1',
          testRunId: 'test-run-1',
          path: ['some test', '0:step one'],
        });
      });
    });

    describe('marking a step as failed', () => {
      beforeEach(() => {
        slice.slice('agents', 'agent-1', 'result', 'steps', 0).update((s) => ({
          ...s,
          status: 'failed',
          error: { message: 'blah' },
          timeout: false
        }));
      });

      it('generates a test event', async () => {
        let { value } = await actions.fork(subscription.next());
        expect(value).toMatchObject({
          type: 'step:result',
          status: 'failed',
          agentId: 'agent-1',
          testRunId: 'test-run-1',
          path: ['some test', '0:step one'],
          error: { message: 'blah' },
          timeout: false,
        });
      });
    });
  });

  describe('assertions', () => {
    describe('marking a assertion as running', () => {
      beforeEach(() => {
        slice.slice('agents', 'agent-1', 'result', 'assertions', 0, 'status').set('running');
      });

      it('generates a test event', async () => {
        let { value } = await actions.fork(subscription.next());
        expect(value).toMatchObject({
          type: 'assertion:running',
          agentId: 'agent-1',
          testRunId: 'test-run-1',
          path: ['some test', 'assertion one'],
        });
      });
    });

    describe('marking a assertion as ok', () => {
      beforeEach(() => {
        slice.slice('agents', 'agent-1', 'result', 'assertions', 0, 'status').set('ok');
      });

      it('generates a test event', async () => {
        let { value } = await actions.fork(subscription.next());
        expect(value).toMatchObject({
          type: 'assertion:result',
          status: 'ok',
          agentId: 'agent-1',
          testRunId: 'test-run-1',
          path: ['some test', 'assertion one'],
        });
      });
    });

    describe('marking a assertion as failed', () => {
      beforeEach(() => {
        slice.slice('agents', 'agent-1', 'result', 'assertions', 0).update((s) => ({
          ...s,
          status: 'failed',
          error: { message: 'blah' },
          timeout: false
        }));
      });

      it('generates a test event', async () => {
        let { value } = await actions.fork(subscription.next());
        expect(value).toMatchObject({
          type: 'assertion:result',
          status: 'failed',
          agentId: 'agent-1',
          testRunId: 'test-run-1',
          path: ['some test', 'assertion one'],
          error: { message: 'blah' },
          timeout: false,
        });
      });
    });
  });

  describe('tests', () => {
    describe('marking a test as running', () => {
      beforeEach(() => {
        slice.slice('agents', 'agent-1', 'result', 'status').set('running');
      });

      it('generates a test event', async () => {
        let { value } = await actions.fork(subscription.next());
        expect(value).toMatchObject({
          type: 'test:running',
          agentId: 'agent-1',
          testRunId: 'test-run-1',
          path: ['some test'],
        });
      });
    });

    describe('marking a test as ok', () => {
      beforeEach(() => {
        slice.slice('agents', 'agent-1', 'result', 'status').set('ok');
      });

      it('generates a test event', async () => {
        let { value } = await actions.fork(subscription.next());
        expect(value).toMatchObject({
          type: 'test:result',
          status: 'ok',
          agentId: 'agent-1',
          testRunId: 'test-run-1',
          path: ['some test'],
        });
      });
    });

    describe('marking a test as failed', () => {
      beforeEach(() => {
        slice.slice('agents', 'agent-1', 'result').update((s) => ({
          ...s,
          status: 'failed',
          error: { message: 'blah' },
          timeout: false
        }));
      });

      it('generates a test event', async () => {
        let { value } = await actions.fork(subscription.next());
        expect(value).toMatchObject({
          type: 'test:result',
          status: 'failed',
          agentId: 'agent-1',
          testRunId: 'test-run-1',
          path: ['some test'],
          error: { message: 'blah' },
          timeout: false,
        });
      });
    });
  });

  describe('agents', () => {
    describe('marking a agent as running', () => {
      beforeEach(() => {
        slice.slice('agents', 'agent-1', 'status').set('running');
      });

      it('generates a test event', async () => {
        let { value } = await actions.fork(subscription.next());
        expect(value).toMatchObject({
          type: 'testRunAgent:running',
          agentId: 'agent-1',
          testRunId: 'test-run-1'
        });
      });
    });

    describe('marking a agent as ok', () => {
      beforeEach(() => {
        slice.slice('agents', 'agent-1', 'status').set('ok');
      });

      it('generates a test event', async () => {
        let { value } = await actions.fork(subscription.next());
        expect(value).toMatchObject({
          type: 'testRunAgent:result',
          status: 'ok',
          agentId: 'agent-1',
          testRunId: 'test-run-1'
        });
      });
    });

    describe('marking a agent as failed', () => {
      beforeEach(() => {
        slice.slice('agents', 'agent-1').update((s) => ({
          ...s,
          status: 'failed',
          error: { message: 'blah' },
          timeout: false
        }));
      });

      it('generates a test event', async () => {
        let { value } = await actions.fork(subscription.next());
        expect(value).toMatchObject({
          type: 'testRunAgent:result',
          status: 'failed',
          agentId: 'agent-1',
          testRunId: 'test-run-1',
          error: { message: 'blah' },
          timeout: false,
        });
      });
    });
  });

  describe('test run', () => {
    describe('marking a test run as running', () => {
      beforeEach(() => {
        slice.slice('status').set('running');
      });

      it('generates a test event', async () => {
        let { value } = await actions.fork(subscription.next());
        expect(value).toMatchObject({
          type: 'testRun:running',
          testRunId: 'test-run-1'
        });
      });
    });

    describe('marking a test run as ok', () => {
      beforeEach(() => {
        slice.slice('status').set('ok');
      });

      it('generates a test event', async () => {
        let { value } = await actions.fork(subscription.next());
        expect(value).toMatchObject({
          type: 'testRun:result',
          status: 'ok',
          testRunId: 'test-run-1'
        });
      });
    });

    describe('marking a test run as failed', () => {
      beforeEach(() => {
        slice.update((s) => ({
          ...s,
          status: 'failed',
          error: { message: 'blah' },
          timeout: false
        }));
      });

      it('generates a test event', async () => {
        let { value } = await actions.fork(subscription.next());
        expect(value).toMatchObject({
          type: 'testRun:result',
          status: 'failed',
          testRunId: 'test-run-1',
          error: { message: 'blah' },
          timeout: false,
        });
      });
    });
  });

  describe('finishing all items', () => {
    beforeEach(() => {
      slice.slice('status').set('ok');
      slice.slice('agents', 'agent-1', 'status').set('ok');
      slice.slice('agents', 'agent-1', 'result', 'status').set('ok');
      slice.slice('agents', 'agent-1', 'result', 'steps', 0, 'status').set('failed');
      slice.slice('agents', 'agent-1', 'result', 'steps', 1, 'status').set('disregarded');
      slice.slice('agents', 'agent-1', 'result', 'assertions', 0, 'status').set('disregarded');
      slice.slice('agents', 'agent-1', 'result', 'assertions', 1, 'status').set('ok');
      slice.slice('agents', 'agent-1', 'result', 'children', 0, 'status').set('ok');
      slice.slice('agents', 'agent-1', 'result', 'children', 0, 'steps', 0, 'status').set('ok');
      slice.slice('agents', 'agent-1', 'result', 'children', 0, 'assertions', 0, 'status').set('ok');
    });

    it('terminates subscription', async() => {
      while(true) {
        let { done } = await actions.fork(subscription.next());
        if(done) break;
      }
    });
  });

  describe('on an already finished run', () => {
    beforeEach(async () => {
      slice.slice('status').set('ok');
      slice.slice('agents', 'agent-1', 'status').set('ok');
      slice.slice('agents', 'agent-1', 'result', 'status').set('ok');
      slice.slice('agents', 'agent-1', 'result', 'steps', 0, 'status').set('failed');
      slice.slice('agents', 'agent-1', 'result', 'steps', 1, 'status').set('disregarded');
      slice.slice('agents', 'agent-1', 'result', 'assertions', 0, 'status').set('disregarded');
      slice.slice('agents', 'agent-1', 'result', 'assertions', 1, 'status').set('ok');
      slice.slice('agents', 'agent-1', 'result', 'children', 0, 'status').set('ok');
      slice.slice('agents', 'agent-1', 'result', 'children', 0, 'steps', 0, 'status').set('ok');
      slice.slice('agents', 'agent-1', 'result', 'children', 0, 'assertions', 0, 'status').set('ok');
      subscription = await actions.fork(resultStream('test-run-1', slice));
    });

    it('terminates subscription', async() => {
      while(true) {
        let { done } = await actions.fork(subscription.next());
        if(done) break;
      }
    });

    it('generates a result event for each result', async () => {
      await actions.fork(subscription.match({
        type: 'step:result',
        status: 'failed',
        agentId: 'agent-1',
        testRunId: 'test-run-1',
        path: ['some test', '0:step one'],
      }).expect());
    });
  });
});
