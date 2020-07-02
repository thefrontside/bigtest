import * as Bowser from 'bowser';
import { TestImplementation } from '@bigtest/suite';
import { bigtestGlobals } from '@bigtest/globals';
import { TestFrame } from './test-frame';
import { QueryParams } from './query-params';
import { Agent, Run } from '../shared/agent';
import { runLane } from './lane';
import { loadManifest } from './manifest';

export function* createAgent(queryParams: QueryParams) {
  console.log('[agent] connecting to', queryParams.connectTo);

  let testFrame = yield TestFrame.start();

  let createSocket = () => new WebSocket(queryParams.connectTo);
  let agent: Agent = yield Agent.start({
    createSocket,
    agentId: queryParams.agentId,
    data: Bowser.parse(navigator.userAgent)
  });

  yield agent.commands.forEach(function*(command) {
    console.log('[agent] received command', command);

    if (command.type === "run") {
      yield run(agent, testFrame, command);
    }
  });

  console.debug('[agent] complete');
}

function* lanePaths(test: TestImplementation, prefix: string[] = []): Generator<string[]> {
  let path = prefix.concat(test.description);
  if(test.children.length === 0) {
    yield path;
  } else {
    for(let child of test.children) {
      yield* lanePaths(child, path);
    }
  }
}

function* run(agent: Agent, testFrame: TestFrame, command: Run) {
  let { appUrl, manifestUrl, testRunId } = command;

  console.log('[agent] loading test manifest via', manifestUrl);
  let test = yield loadManifest(manifestUrl);

  console.log('[agent] beginning test run', testRunId);
  agent.send({ type: 'run:begin', testRunId });

  try {
    for (let lanePath of lanePaths(test)) {
      console.log('[agent] running lane', lanePath);

      bigtestGlobals.appUrl = appUrl;
      yield testFrame.clear();
      yield runLane(testRunId, agent, test, lanePath);
      console.log('[agent] lane completed', lanePath);
    }
  } finally {
    console.log('[agent] test run completed', testRunId);
    agent.send({ type: 'run:end', testRunId });
  }
}

