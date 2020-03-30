import * as Bowser from 'bowser';
import { Test } from '@bigtest/suite';
import { TestFrame } from './test-frame';
import { SocketConnection } from './socket-connection';

export function* createAgent(connectTo: string) {
  if (!connectTo) {
    throw new Error("no orchestrator URL given, please specify the URL of the orchestrator by setting the `orchestrator` query param");
  }

  console.log('[agent] connecting to', connectTo);

  let testFrame = yield TestFrame.start();
  let connection = yield SocketConnection.start(connectTo);

  connection.send({
    type: 'connected',
    data: Bowser.parse(navigator.userAgent)
  });

  while(true) {
    console.log('[agent] waiting for message');
    let message = yield connection.receive();
    console.log('[agent] receive message', message);

    if(message.type === "run") {
      yield run(connection, testFrame, message);
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

function* run(connection: SocketConnection, testFrame: TestFrame, { appUrl, manifestUrl, testRunId, tree }) {
  console.log('[agent] loading test app via', appUrl);

  connection.send({ type: 'run:begin', testRunId });

  try {
    for (let leafPath of leafPaths(tree)) {
      console.log('[agent] running test', leafPath);
      yield testFrame.load(appUrl);
      testFrame.send({ type: 'run', manifestUrl, path: leafPath });
      while(true) {
        let message = yield testFrame.receive();
        console.log('[lane] ->', message);
        connection.send({ ...message, testRunId });

        if(message.type === 'lane:end') {
          break;
        }
      }
    }
  } finally {
    connection.send({ type: 'run:end', testRunId });
  }
}
