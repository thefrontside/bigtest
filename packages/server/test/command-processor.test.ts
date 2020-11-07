import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';

import { Mailbox } from '@bigtest/effection';
import { Atom } from '@bigtest/atom';

import { AgentEvent, Command as AgentCommand } from '@bigtest/agent';

import { actions, getTestProjectOptions } from './helpers';
import { createCommandProcessor } from '../src/command-processor';
import { createOrchestratorAtom } from '../src/orchestrator/atom';
import { CommandMessage } from '../src/command-server';

import { OrchestratorState, TestRunState } from '../src/orchestrator/state';

describe('command processor', () => {
  let delegate: Mailbox<AgentCommand & { agentId: string }>;
  let events: Mailbox<AgentEvent>;
  let commands: Mailbox<CommandMessage>;
  let atom: Atom<OrchestratorState>;

  beforeEach(async () => {
    delegate = new Mailbox();
    events = new Mailbox();
    commands = new Mailbox();
    atom = createOrchestratorAtom(getTestProjectOptions());
    atom.slice()('agents', 'agent-1').set({
      agentId: 'agent-1',
      browser: { name: "Safari", version: "13.0.4" },
      os: { name: "macOS", version: "10.15.2", versionName: "Catalina" },
      platform: { type: "desktop", vendor: "Apple" },
      engine: { name: "Gecko", version: "5.0" }
    });
    atom.slice()('manifest').set({
      fileName: 'manifest-1234.js',
      description: 'the manifest',
      steps: [],
      assertions: [],
      children: [],
    });
    actions.fork(createCommandProcessor({
      atom,
      events,
      commands,
      delegate,
      proxyPort: 24201,
      manifestPort: 24202,
    }));
  });

  describe('when sent a `run` message with a valid manifest', () => {
    let pendingMessage: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    let testRun: TestRunState;

    beforeEach(async () => {
      atom.slice()('bundler', 'type').set('GREEN');
      commands.send({ type: 'run', id: 'test-id-1', files: [] });
      pendingMessage = await actions.fork(delegate.receive({ type: 'run' }));
      events.send({type: 'run:end', testRunId: 'test-id-1', agentId: 'agent-1' });
      testRun = await actions.fork(atom.slice()('testRuns', 'test-id-1').once((testRun) => testRun?.status === 'ok'));
    });

    it('runs on the available agents', () => {
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
      expect(testRun.status).toEqual('ok');
      expect(Object.values(testRun.agents).length).toEqual(1);
      expect(testRun.agents['agent-1'].agent.agentId).toEqual('agent-1');
      expect(testRun.agents['agent-1'].result.description).toEqual('the manifest');
    });
  });

  describe('when sent a `run` message with a broken manifest', () => {
    let testRun: TestRunState;

    beforeEach(async () => {
      atom.slice()('bundler').set({ type: 'ERRORED', error: { message: 'it broke' }});
      commands.send({ type: 'run', id: 'test-id-1', files: [] });
      testRun = await actions.fork(atom.slice()('testRuns', 'test-id-1').once((testRun) => testRun?.status === 'failed'));
    });

    it('marks test run as failed', () => {
      expect(testRun.status).toEqual('failed');
      expect(testRun.error?.message).toEqual('Cannot run tests due to build errors in the test suite:\nit broke');
      expect(Object.values(testRun.agents).length).toEqual(0);
    });
  });
});
