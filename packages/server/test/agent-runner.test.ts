import { describe, beforeEach, it } from '@effection/mocha';
import expect from 'expect';

import { Stream } from 'effection';
import { DuplexChannel, createDuplexChannel } from '@effection/duplex-channel';
import { Slice } from '@effection/atom';

import { createAgentRunner, Runner } from '../src/runner';
import { createOrchestratorAtom } from '../src/orchestrator/atom';
import { Incoming as ConnectionIncoming, Outgoing as ConnectionOutgoing } from '../src/connection-server';

import { OrchestratorState, TestRunState } from '../src/orchestrator/state';

describe('agent runner', () => {
  let messages: Stream<ConnectionOutgoing>;
  let atom: Slice<OrchestratorState>;
  let channel: DuplexChannel<ConnectionIncoming, ConnectionOutgoing>;
  let connections: DuplexChannel<ConnectionOutgoing, ConnectionIncoming>;
  let runner: Runner;

  beforeEach(function*() {
    [channel, connections] = createDuplexChannel<ConnectionIncoming, ConnectionOutgoing>();

    messages = yield connections.buffered();
    atom = createOrchestratorAtom({
      manifest: {
        fileName: 'manifest-1234.js',
        description: 'the manifest',
      },
      agents: {
        'agent-1': {
          agentId: 'agent-1',
          browser: { name: "Safari", version: "13.0.4" },
          os: { name: "macOS", version: "10.15.2", versionName: "Catalina" },
          platform: { type: "desktop", vendor: "Apple" },
          engine: { name: "Gecko", version: "5.0" }
        },
      }
    });
    runner = yield createAgentRunner({
      atom,
      channel,
      proxyPort: 24201,
      manifestPort: 24202,
    });
  });

  describe('when sent a `run` message with a valid manifest', () => {
    let pendingMessage: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    let testRun: TestRunState;

    beforeEach(function*() {
      atom.slice('bundler', 'type').set('GREEN');
      runner.runTest({ testRunId: 'test-id-1', files: [] });
      pendingMessage = yield messages.match({ type: 'run' }).expect();
      connections.send({type: 'run:end', testRunId: 'test-id-1', agentId: 'agent-1' });
      testRun = yield atom.slice('testRuns', 'test-id-1').match({ status: 'ok' }).expect();
    });

    it('runs on the available agents', function*() {
      expect(pendingMessage.agentId).toEqual('agent-1');
    });

    it('sends the id of the test', function*() {
      expect(pendingMessage.testRunId).toEqual('test-id-1');
    });

    it('sends appUrl', function*() {
      expect(pendingMessage.appUrl).toEqual('http://localhost:24201');
    });

    it('sends manifestUrl', function*() {
      expect(pendingMessage.manifestUrl).toEqual('http://localhost:24202/manifest-1234.js');
    });

    it('sends entire manifest as test tree for now', function*() {
      expect(pendingMessage.tree.description).toEqual('the manifest');
    });

    it('adds agent and test tree to manifest', function*() {
      expect(testRun.status).toEqual('ok');
      expect(Object.values(testRun.agents).length).toEqual(1);
      expect(testRun.agents['agent-1'].agent.agentId).toEqual('agent-1');
      expect(testRun.agents['agent-1'].result.description).toEqual('the manifest');
    });
  });

  describe('when sent a `run` message with a broken manifest', () => {
    let testRun: TestRunState;

    beforeEach(function*() {
      atom.slice('bundler').set({ type: 'ERRORED', error: { message: 'it broke' }});
      runner.runTest({ testRunId: 'test-id-1', files: [] });
      testRun = yield atom.slice('testRuns', 'test-id-1').match({ status: 'failed' }).expect();
    });

    it('marks test run as failed', function*() {
      expect(testRun.status).toEqual('failed');
      expect(testRun.error?.message).toEqual('it broke');
      expect(Object.values(testRun.agents).length).toEqual(0);
    });
  });
});
