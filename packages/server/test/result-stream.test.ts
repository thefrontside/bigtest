import { describe, beforeEach, it } from '@effection/mocha';
import expect from 'expect';

import { Subscription } from 'effection';

import { createAtom, Slice } from '@effection/atom';

import { resultStream } from '../src/result-stream';
import { TestRunState } from '../src/orchestrator/state';
import { TestEvent } from '../src/schema/test-event';

describe('result stream', () => {
  let slice: Slice<TestRunState>;
  let subscription: Subscription<TestEvent, void>;

  beforeEach(function*(world) {
    slice = createAtom({
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
    } as TestRunState);

    subscription = resultStream('test-run-1', slice).subscribe(world);
  });

  describe('steps', () => {
    describe('marking a step as running', () => {
      beforeEach(function*() {
        slice.slice('agents', 'agent-1', 'result', 'steps', 0, 'status').set('running');
      });

      it('generates a test event', function*() {
        let { value } = yield subscription.next();
        expect(value).toMatchObject({
          type: 'step:running',
          agentId: 'agent-1',
          testRunId: 'test-run-1',
          path: ['some test', '0:step one'],
        });
      });
    });

    describe('marking a step as ok', () => {
      beforeEach(function*() {
        slice.slice('agents', 'agent-1', 'result', 'steps', 0, 'status').set('ok');
      });

      it('generates a test event', function*() {
        let { value } = yield subscription.next();
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
      beforeEach(function*() {
        slice.slice('agents', 'agent-1', 'result', 'steps', 0).update((s) => ({
          ...s,
          status: 'failed',
          error: { message: 'blah' },
          timeout: false
        }));
      });

      it('generates a test event', function*() {
        let { value } = yield subscription.next();
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
      beforeEach(function*() {
        slice.slice('agents', 'agent-1', 'result', 'assertions', 0, 'status').set('running');
      });

      it('generates a test event', function*() {
        let { value } = yield subscription.next();
        expect(value).toMatchObject({
          type: 'assertion:running',
          agentId: 'agent-1',
          testRunId: 'test-run-1',
          path: ['some test', 'assertion one'],
        });
      });
    });

    describe('marking a assertion as ok', () => {
      beforeEach(function*() {
        slice.slice('agents', 'agent-1', 'result', 'assertions', 0, 'status').set('ok');
      });

      it('generates a test event', function*() {
        let { value } = yield subscription.next();
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
      beforeEach(function*() {
        slice.slice('agents', 'agent-1', 'result', 'assertions', 0).update((s) => ({
          ...s,
          status: 'failed',
          error: { message: 'blah' },
          timeout: false
        }));
      });

      it('generates a test event', function*() {
        let { value } = yield subscription.next();
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
      beforeEach(function*() {
        slice.slice('agents', 'agent-1', 'result', 'status').set('running');
      });

      it('generates a test event', function*() {
        let { value } = yield subscription.next();
        expect(value).toMatchObject({
          type: 'test:running',
          agentId: 'agent-1',
          testRunId: 'test-run-1',
          path: ['some test'],
        });
      });
    });

    describe('marking a test as ok', () => {
      beforeEach(function*() {
        slice.slice('agents', 'agent-1', 'result', 'status').set('ok');
      });

      it('generates a test event', function*() {
        let { value } = yield subscription.next();
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
      beforeEach(function*() {
        slice.slice('agents', 'agent-1', 'result').update((s) => ({
          ...s,
          status: 'failed',
          error: { message: 'blah' },
          timeout: false
        }));
      });

      it('generates a test event', function*() {
        let { value } = yield subscription.next();
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
      beforeEach(function*() {
        slice.slice('agents', 'agent-1', 'status').set('running');
      });

      it('generates a test event', function*() {
        let { value } = yield subscription.next();
        expect(value).toMatchObject({
          type: 'testRunAgent:running',
          agentId: 'agent-1',
          testRunId: 'test-run-1'
        });
      });
    });

    describe('marking a agent as ok', () => {
      beforeEach(function*() {
        slice.slice('agents', 'agent-1', 'status').set('ok');
      });

      it('generates a test event', function*() {
        let { value } = yield subscription.next();
        expect(value).toMatchObject({
          type: 'testRunAgent:result',
          status: 'ok',
          agentId: 'agent-1',
          testRunId: 'test-run-1'
        });
      });
    });

    describe('marking a agent as failed', () => {
      beforeEach(function*() {
        slice.slice('agents', 'agent-1').update((s) => ({
          ...s,
          status: 'failed',
          error: { message: 'blah' },
          timeout: false
        }));
      });

      it('generates a test event', function*() {
        let { value } = yield subscription.next();
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
      beforeEach(function*() {
        slice.slice('status').set('running');
      });

      it('generates a test event', function*() {
        let { value } = yield subscription.next();
        expect(value).toMatchObject({
          type: 'testRun:running',
          testRunId: 'test-run-1'
        });
      });
    });

    describe('marking a test run as ok', () => {
      beforeEach(function*() {
        slice.slice('status').set('ok');
      });

      it('generates a test event', function*() {
        let { value } = yield subscription.next();
        expect(value).toMatchObject({
          type: 'testRun:result',
          status: 'ok',
          testRunId: 'test-run-1'
        });
      });
    });

    describe('marking a test run as failed', () => {
      beforeEach(function*() {
        slice.update((s) => ({
          ...s,
          status: 'failed',
          error: { message: 'blah' },
          timeout: false
        }));
      });

      it('generates a test event', function*() {
        let { value } = yield subscription.next();
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
    beforeEach(function*() {
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

    it('terminates subscription', function*() {
      while(true) {
        let { done } = yield subscription.next();
        if(done) break;
      }
    });
  });

  describe('on an already finished run', () => {
    beforeEach(function*(world) {
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
      subscription = resultStream('test-run-1', slice).subscribe(world);
    });

    it('terminates subscription', function*() {
      while(true) {
        let { done } = yield subscription.next();
        if(done) break;
      }
    });

    it('generates a result event for each result', function*() {
      let { value } = yield subscription.next();
      expect(value).toMatchObject({
        type: 'step:result',
        status: 'failed',
        agentId: 'agent-1',
        testRunId: 'test-run-1',
        path: ['some test', '0:step one'],
      });
    });
  });
});
