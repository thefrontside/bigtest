import 'regenerator-runtime/runtime';
import { main, fork } from 'effection';
import * as Bowser from 'bowser';
import { TestFrame } from './test-frame';
import { SocketConnection } from './socket-connection';
import { queryParams } from './query-params';

if(queryParams.connectTo) {
  main(createAgent(queryParams.connectTo));
} else {
  throw new Error("no orchestrator URL given, please specify the URL of the orchestrator by setting the `orchestrator` query param");
}

function* createAgent(connectTo: string) {
  let testFrame = yield TestFrame.start();
  let connection = yield SocketConnection.start(connectTo);

  fork(function*() {
    while(true) {
      let message = yield testFrame.receive();
      console.log('[agent] received message from harness:', message);
    }
  });

  connection.send({
    type: 'connected',
    data: Bowser.parse(navigator.userAgent)
  });

  while(true) {
    let message = yield connection.receive();

    if(message.type === "run") {
      fork(run(testFrame, message));
    }
  }
}

function* run(testFrame: TestFrame, { appUrl, manifestUrl, testRunId, tree }) {
  console.log('[agent] loading test app via', appUrl);

  yield testFrame.load(appUrl);
}

