import { Queue, createQueue, spawn } from 'effection';
import { describe, beforeEach, it } from '@effection/mocha';
import expect from 'expect';

import { createAtom, Slice } from '@effection/atom';

import { TestRunState } from '../src/orchestrator/state';
import { Incoming } from '../src/connection-server';
import { aggregate } from '../src/result-aggregator';
import { TestEvent } from '../src/schema/test-event';

const testRunId = 'test-run-1';

function expectContainsObject<R>(actual: R, matching: Record<string, unknown>) {
  expect(actual).toEqual(expect.arrayContaining([expect.objectContaining(matching)]));
}

function expectNotContainsObject<R>(actual: R, matching: Record<string, unknown>) {
  expect(actual).not.toEqual(expect.arrayContaining([expect.objectContaining(matching)]));
}

describe('result aggregator', () => {
  let slice: Slice<TestRunState>;
  let queue: Queue<Incoming>;
  let events: TestEvent[];

  beforeEach(function*() {
    slice = createAtom({
      testRunId,
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

    queue = createQueue();
    events = [];

    yield spawn(aggregate(queue, slice, (event) => events.push(event)));
  });

  describe('run messages', () => {
    it('marks agent as running', function*() {
      queue.send({ type: 'run:begin', agentId: 'agent-1', testRunId });
      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'running' });
    });

    it('waits for tests to complete before finishing run', function*() {
      queue.send({ type: 'run:end', agentId: 'agent-1', testRunId });
      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'pending' });
    });

    it('marks agent as ok when tests are all ok', function*() {
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '0:step one'] });
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '1:step two'] });
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'another test', '0:a child step'] });
      queue.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion one'] });
      queue.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion two'] });
      queue.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'another test', 'a child assertion'] });

      expect(slice.slice('agents', 'agent-1', 'result').get()).toMatchObject({ status: 'ok' });
      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'pending' });

      queue.send({ type: 'run:end', agentId: 'agent-1', testRunId });

      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'ok' });
    });

    it('marks agent as failed when step fails', function*() {
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'failed', testRunId, path: ['some test', '0:step one'] });

      expect(slice.slice('agents', 'agent-1', 'result').get()).toMatchObject({ status: 'failed' });
      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'pending' });

      queue.send({ type: 'run:end', agentId: 'agent-1', testRunId });

      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'failed' });
    });

    it('marks agent as failed when child step fails', function*() {
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '0:step one'] });
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '1:step two'] });
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'failed', testRunId, path: ['some test', 'another test', '0:a child step'] });
      queue.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion one'] });
      queue.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion two'] });

      expect(slice.slice('agents', 'agent-1', 'result').get()).toMatchObject({ status: 'failed' });
      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'pending' });

      queue.send({ type: 'run:end', agentId: 'agent-1', testRunId });

      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'failed' });
    });

    it('marks agent as failed when assertion fails', function*() {
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '0:step one'] });
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '1:step two'] });
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'another test', '0:a child step'] });
      queue.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion one'] });
      queue.send({ type: 'assertion:result', agentId: 'agent-1', status: 'failed', testRunId, path: ['some test', 'assertion two'] });
      queue.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'another test', 'a child assertion'] });

      expect(slice.slice('agents', 'agent-1', 'result').get()).toMatchObject({ status: 'failed' });
      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'pending' });

      queue.send({ type: 'run:end', agentId: 'agent-1', testRunId });

      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'failed' });
    });

    it('marks agent as failed when child assertion fails', function*() {
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '0:step one'] });
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '1:step two'] });
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'another test', '0:a child step'] });
      queue.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion one'] });
      queue.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion two'] });
      queue.send({ type: 'assertion:result', agentId: 'agent-1', status: 'failed', testRunId, path: ['some test', 'another test', 'a child assertion'] });

      expect(slice.slice('agents', 'agent-1', 'result').get()).toMatchObject({ status: 'failed' });
      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'pending' });

      queue.send({ type: 'run:end', agentId: 'agent-1', testRunId });

      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'failed' });
    });
  });

  describe('step messages', () => {
    it('marks step as running', function*() {
      queue.send({ type: 'step:running', agentId: 'agent-1', testRunId, path: ['some test', '0:step one'] });
      expect(slice.slice('agents', 'agent-1', 'result', 'steps', 0).get()).toMatchObject({ status: 'running' });

      expectContainsObject(events, {
        testRunId: 'test-run-1',
        agentId: 'agent-1',
        path: [ 'some test', '0:step one' ],
        type: 'step',
        status: 'running',
      });
    });

    it('does not mark as runnign when already finished', function*() {
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '0:step one'] });
      queue.send({ type: 'step:running', agentId: 'agent-1', testRunId, path: ['some test', '0:step one'] });
      expect(slice.slice('agents', 'agent-1', 'result', 'steps', 0).get()).toMatchObject({ status: 'ok' });

      expectNotContainsObject(events, { status: 'running' });
    });

    it('marks step as ok', function*() {
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '0:step one'] });
      expect(slice.slice('agents', 'agent-1', 'result', 'steps', 0).get()).toMatchObject({ status: 'ok' });

      expectContainsObject(events, {
        testRunId: 'test-run-1',
        agentId: 'agent-1',
        path: [ 'some test', '0:step one' ],
        type: 'step',
        status: 'ok',
      });
    });

    it('marks step as errored', function*() {
      queue.send({
        type: 'step:result',
        agentId: 'agent-1',
        status: 'failed',
        testRunId,
        path: ['some test', '0:step one'],
        error: {
          message: 'boom'
        }
      });
      expect(slice.slice('agents', 'agent-1', 'result', 'steps', 0).get()).toMatchObject({ status: 'failed', error: { message: 'boom' } });

      expectContainsObject(events, {
        testRunId: 'test-run-1',
        agentId: 'agent-1',
        path: [ 'some test', '0:step one' ],
        type: 'step',
        status: 'failed',
        error: { message: 'boom' },
      });
    });

    it('marks following steps and assertions as disregarded', function*() {
      queue.send({ type: 'step:result', agentId: 'agent-1', status: 'failed', testRunId, path: ['some test', '0:step one'] });

      expect(slice.slice('agents', 'agent-1', 'result', 'steps', 0).get()).toMatchObject({ status: 'failed' });
      expect(slice.slice('agents', 'agent-1', 'result', 'steps', 1).get()).toMatchObject({ status: 'disregarded' });
      expect(slice.slice('agents', 'agent-1', 'result', 'assertions', 0).get()).toMatchObject({ status: 'disregarded' });
      expect(slice.slice('agents', 'agent-1', 'result', 'assertions', 1).get()).toMatchObject({ status: 'disregarded' });
      expect(slice.slice('agents', 'agent-1', 'result', 'children', 0).get()).toMatchObject({ status: 'disregarded' });

      expectContainsObject(events, {
        testRunId: 'test-run-1',
        agentId: 'agent-1',
        path: [ 'some test', '1:step two' ],
        type: 'step',
        status: 'disregarded',
      });
    });
  });

  describe('assertion messages', () => {
    it('marks assertion as running', function*() {
      queue.send({ type: 'assertion:running', agentId: 'agent-1', testRunId, path: ['some test', 'assertion one'] });
      expect(slice.slice('agents', 'agent-1', 'result', 'assertions', 0).get()).toMatchObject({ status: 'running' });

      expectContainsObject(events, {
        testRunId: 'test-run-1',
        agentId: 'agent-1',
        path: [ 'some test', 'assertion one' ],
        type: 'assertion',
        status: 'running',
      });
    });

    it('does not mark as runnign when already finished', function*() {
      queue.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion one'] });
      queue.send({ type: 'assertion:running', agentId: 'agent-1', testRunId, path: ['some test', 'assertion one'] });
      expect(slice.slice('agents', 'agent-1', 'result', 'assertions', 0).get()).toMatchObject({ status: 'ok' });

      expectNotContainsObject(events, { status: 'running' });
    });

    it('marks assertion as ok', function*() {
      queue.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion one'] });
      expect(slice.slice('agents', 'agent-1', 'result', 'assertions', 0).get()).toMatchObject({ status: 'ok' });

      expectContainsObject(events, {
        testRunId: 'test-run-1',
        agentId: 'agent-1',
        path: [ 'some test', 'assertion one' ],
        type: 'assertion',
        status: 'ok',
      });
    });

    it('marks assertion as errored', function*() {
      queue.send({
        type: 'assertion:result',
        agentId: 'agent-1',
        status: 'failed',
        testRunId: 'run-1',
        path: ['some test', 'assertion one'],
        error: {
          message: 'boom'
        }
      });
      expect(slice.slice('agents', 'agent-1', 'result', 'assertions', 0).get()).toMatchObject({ status: 'failed', error: { message: 'boom' } });

      expectContainsObject(events, {
        testRunId: 'test-run-1',
        agentId: 'agent-1',
        path: [ 'some test', 'assertion one' ],
        type: 'assertion',
        status: 'failed',
        error: { message: 'boom' },
      });
    });
  });
});
