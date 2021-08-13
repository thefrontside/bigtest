import { Operation, createChannel, once } from 'effection';
import { Test } from '@bigtest/suite';

import { Run, TestEvent, AgentProtocol } from '../shared/protocol';

import { setLaneConfigFromAgentFrame } from './lane-config';
import { setCoverageMap, getCoverageMap } from './coverage';
import { findIFrame } from './find-iframe';

export function* run(agent: AgentProtocol, command: Run): Operation<void> {
  let { testRunId, tree } = command;

  try {
    console.log("[agent] starting test run", testRunId);
    setCoverageMap(window, undefined);
    agent.send({ type: 'run:begin', testRunId });
    for (let lanePath of lanePaths(tree)) {
      console.log('[agent] running lane', lanePath);

      yield runLane(agent, command, lanePath);

      console.log('[agent] lane completed', lanePath);
    }
  } finally {
    console.log('[agent] test run completed', testRunId);
    agent.send({ type: 'run:end', testRunId, coverage: getCoverageMap(window)?.toJSON() });
  }
}

function* runLane(agent: AgentProtocol, command: Run, path: string[]): Operation<void> {
  let { testRunId } = command;
  agent.send({ type: 'lane:begin', testRunId, path });

  try {
    let events = createChannel<TestEvent, undefined>();
    setLaneConfigFromAgentFrame({ command, path, events });

    yield loadTestFrame('test-frame', 'test-frame.html');

    yield events.forEach((event) => { agent.send(event); });

  } finally {
    agent.send({ type: 'lane:end', testRunId, path })
  }
}

function* lanePaths(test: Test, prefix: string[] = []): Generator<string[]> {
  let path = prefix.concat(test.description);
  if(test.children.length === 0) {
    yield path;
  } else {
    for(let child of test.children) {
      yield* lanePaths(child, path);
    }
  }
}

function* loadTestFrame(id: string, src: string): Operation<void> {
  let element = findIFrame(id);

  if (element.src.trim() !== 'about:blank') {
    element.src = 'about:blank';
    yield once(element, 'load');
  }
  element.src = src;
}
