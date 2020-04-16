import * as Bowser from 'bowser';
import { Test } from '@bigtest/suite';
import { TestFrame } from './test-frame';
import { Agent, Command, Run } from '../shared/agent';

export function* createAgent(connectTo: string) {
  if (!connectTo) {
    throw new Error("no orchestrator URL given, please specify the URL of the orchestrator by setting the `orchestrator` query param");
  }

  console.log('[agent] connecting to', connectTo);

  let testFrame = yield TestFrame.start();

  let createSocket = () => new WebSocket(connectTo);
  let agent: Agent = yield Agent.start(createSocket);

  agent.send({
    type: 'connected',
    data: Bowser.parse(navigator.userAgent)
  });

  while(true) {
    console.log('[agent] waiting for message');
    let command: Command = yield agent.receive();
    console.log('[agent] receive message', command);

    if(command.type === "run") {
      yield run(agent, testFrame, command);
    }
  }
}

function* leafPaths(tree: Test, prefix: string[] = []): Generator<string[]> {
  let path = prefix.concat(tree.description);
  if(tree.children.length === 0) {
    yield path;
  } else {
    for(let child of tree.children) {
      yield* leafPaths(child, path);
    }
  }
}

function* run(agent: Agent, testFrame: TestFrame, command: Run) {
  let { appUrl, manifestUrl, testRunId, tree } = command;
  console.log('[agent] loading test app via', appUrl);

  agent.send({ type: 'run:begin', testRunId });

  try {
    for (let leafPath of leafPaths(tree)) {
      console.log('[agent] running test', leafPath);
      yield testFrame.load(appUrl);
      testFrame.send({ type: 'run', manifestUrl, path: leafPath });
      while(true) {
        let message = yield testFrame.receive();
        console.log('[lane] ->', message);
        agent.send({ ...message, testRunId });

        if(message.type === 'lane:end') {
          break;
        }
      }
    }
  } finally {
    agent.send({ type: 'run:end', testRunId });
  }
}
