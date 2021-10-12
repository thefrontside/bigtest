import { Channel, createChannel, spawn } from 'effection';
import { describe, beforeEach, it } from '@effection/mocha';
import expect from 'expect';

import { createAtom, Slice } from '@effection/atom';

import { TestRunState } from '../src/orchestrator/state';
import { Incoming } from '../src/connection-server';
import { aggregateTestRun } from '../src/result-aggregator';

const testRunId = 'test-run-1';

describe('result aggregator', () => {
  let slice: Slice<TestRunState>;
  let channel: Channel<Incoming>;

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

    channel = createChannel();

    yield spawn(aggregateTestRun(channel, slice));
  });

  describe('run messages', () => {
    it('marks agent as running', function*() {
      channel.send({ type: 'run:begin', agentId: 'agent-1', testRunId });
      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'running' });
    });

    it('waits for tests to complete before finishing run', function*() {
      channel.send({ type: 'run:end', agentId: 'agent-1', testRunId });
      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'pending' });
    });

    it('marks agent as ok when tests are all ok', function*() {
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '0:step one'] });
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '1:step two'] });
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'another test', '0:a child step'] });
      channel.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion one'] });
      channel.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion two'] });
      channel.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'another test', 'a child assertion'] });

      expect(slice.slice('agents', 'agent-1', 'result').get()).toMatchObject({ status: 'ok' });
      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'pending' });

      channel.send({ type: 'run:end', agentId: 'agent-1', testRunId });

      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'ok' });
    });

    it('marks agent as failed when step fails', function*() {
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'failed', testRunId, path: ['some test', '0:step one'] });

      expect(slice.slice('agents', 'agent-1', 'result').get()).toMatchObject({ status: 'failed' });
      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'pending' });

      channel.send({ type: 'run:end', agentId: 'agent-1', testRunId });

      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'failed' });
    });

    it('marks agent as failed when child step fails', function*() {
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '0:step one'] });
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '1:step two'] });
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'failed', testRunId, path: ['some test', 'another test', '0:a child step'] });
      channel.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion one'] });
      channel.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion two'] });

      expect(slice.slice('agents', 'agent-1', 'result').get()).toMatchObject({ status: 'failed' });
      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'pending' });

      channel.send({ type: 'run:end', agentId: 'agent-1', testRunId });

      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'failed' });
    });

    it('marks agent as failed when assertion fails', function*() {
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '0:step one'] });
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '1:step two'] });
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'another test', '0:a child step'] });
      channel.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion one'] });
      channel.send({ type: 'assertion:result', agentId: 'agent-1', status: 'failed', testRunId, path: ['some test', 'assertion two'] });
      channel.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'another test', 'a child assertion'] });

      expect(slice.slice('agents', 'agent-1', 'result').get()).toMatchObject({ status: 'failed' });
      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'pending' });

      channel.send({ type: 'run:end', agentId: 'agent-1', testRunId });

      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'failed' });
    });

    it('marks agent as failed when child assertion fails', function*() {
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '0:step one'] });
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '1:step two'] });
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'another test', '0:a child step'] });
      channel.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion one'] });
      channel.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion two'] });
      channel.send({ type: 'assertion:result', agentId: 'agent-1', status: 'failed', testRunId, path: ['some test', 'another test', 'a child assertion'] });

      expect(slice.slice('agents', 'agent-1', 'result').get()).toMatchObject({ status: 'failed' });
      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'pending' });

      channel.send({ type: 'run:end', agentId: 'agent-1', testRunId });

      expect(slice.slice('agents', 'agent-1').get()).toMatchObject({ status: 'failed' });
    });
  });

  describe('step messages', () => {
    it('marks step as running', function*() {
      channel.send({ type: 'step:running', agentId: 'agent-1', testRunId, path: ['some test', '0:step one'] });
      expect(slice.slice('agents', 'agent-1', 'result', 'steps', 0).get()).toMatchObject({ status: 'running' });
    });

    it('does not mark as runnign when already finished', function*() {
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '0:step one'] });
      channel.send({ type: 'step:running', agentId: 'agent-1', testRunId, path: ['some test', '0:step one'] });
      expect(slice.slice('agents', 'agent-1', 'result', 'steps', 0).get()).toMatchObject({ status: 'ok' });
    });

    it('marks step as ok', function*() {
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', '0:step one'] });
      expect(slice.slice('agents', 'agent-1', 'result', 'steps', 0).get()).toMatchObject({ status: 'ok' });
    });

    it('marks step as errored', function*() {
      channel.send({
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
    });

    it('marks following steps and assertions as disregarded', function*() {
      channel.send({ type: 'step:result', agentId: 'agent-1', status: 'failed', testRunId, path: ['some test', '0:step one'] });

      expect(slice.slice('agents', 'agent-1', 'result', 'steps', 0).get()).toMatchObject({ status: 'failed' });
      expect(slice.slice('agents', 'agent-1', 'result', 'steps', 1).get()).toMatchObject({ status: 'disregarded' });
      expect(slice.slice('agents', 'agent-1', 'result', 'assertions', 0).get()).toMatchObject({ status: 'disregarded' });
      expect(slice.slice('agents', 'agent-1', 'result', 'assertions', 1).get()).toMatchObject({ status: 'disregarded' });
      expect(slice.slice('agents', 'agent-1', 'result', 'children', 0).get()).toMatchObject({ status: 'disregarded' });
    });
  });

  describe('assertion messages', () => {
    it('marks assertion as running', function*() {
      channel.send({ type: 'assertion:running', agentId: 'agent-1', testRunId, path: ['some test', 'assertion one'] });
      expect(slice.slice('agents', 'agent-1', 'result', 'assertions', 0).get()).toMatchObject({ status: 'running' });
    });

    it('does not mark as runnign when already finished', function*() {
      channel.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion one'] });
      channel.send({ type: 'assertion:running', agentId: 'agent-1', testRunId, path: ['some test', 'assertion one'] });
      expect(slice.slice('agents', 'agent-1', 'result', 'assertions', 0).get()).toMatchObject({ status: 'ok' });
    });

    it('marks assertion as ok', function*() {
      channel.send({ type: 'assertion:result', agentId: 'agent-1', status: 'ok', testRunId, path: ['some test', 'assertion one'] });
      expect(slice.slice('agents', 'agent-1', 'result', 'assertions', 0).get()).toMatchObject({ status: 'ok' });
    });

    it('marks assertion as errored', function*() {
      channel.send({
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
    });
  });
});
