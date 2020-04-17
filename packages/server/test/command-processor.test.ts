import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';

import { Mailbox } from '@bigtest/effection';
import { Atom } from '@bigtest/atom';

import { actions } from './helpers';
import { createCommandProcessor } from '../src/command-processor';
import { createOrchestratorAtom } from '../src/orchestrator/atom';

import { AgentState, Manifest, TestRunState, OrchestratorState } from '../src/orchestrator/state';

describe('command server', () => {
  let delegate: Mailbox;
  let inbox: Mailbox;
  let atom: Atom<OrchestratorState>;

  beforeEach(async () => {
    delegate = new Mailbox();
    inbox = new Mailbox();
    atom = createOrchestratorAtom();
    atom.slice<AgentState>(['agents', 'agent-1']).set({
      agentId: 'agent-1',
      browser: { name: "Safari", version: "13.0.4" },
      os: { name: "macOS", version: "10.15.2", versionName: "Catalina" },
      platform: { type: "desktop", vendor: "Apple" },
      engine: { name: "Gecko", version: "5.0" }
    });
    atom.slice<Manifest>(['manifest']).set({
      fileName: 'manifest-1234.js',
      description: 'the manifest',
      steps: [],
      assertions: [],
      children: [],
    });
    actions.fork(createCommandProcessor({
      atom,
      inbox,
      delegate,
      proxyPort: 24201,
      manifestPort: 24202,
    }));
  });

  describe('when sent a `run` message', () => {
    let pendingMessage: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    beforeEach(async () => {
      inbox.send({ type: 'run', id: 'test-id-1' });
      pendingMessage = await actions.fork(delegate.receive({ type: 'run', status: 'pending' }));
    });

    it('picks the first available agent for now', () => {
      expect(pendingMessage.agentId).toEqual('agent-1');
    });

    it('sends the id of the test', () => {
      expect(pendingMessage.testRunId).toEqual('test-id-1');
    });

    it('sends appUrl', () => {
      expect(pendingMessage.appUrl).toEqual('http://localhost:24201');
    });

    it('sends manifestUrl', () => {
      expect(pendingMessage.manifestUrl).toEqual('http://localhost:24202/manifest-1234.js');
    });

    it('sends entire manifest as test tree for now', () => {
      expect(pendingMessage.tree.description).toEqual('the manifest');
    });

    it('adds agent and test tree to manifest', () => {
      let testRun = atom.slice<TestRunState>(['testRuns', 'test-id-1']).get();
      expect(testRun.agent.agentId).toEqual('agent-1');
      expect(testRun.tree.description).toEqual('the manifest');
    });
  });
});
