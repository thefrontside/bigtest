import { fork } from 'effection';

import * as Bowser from 'bowser';
import { TestFrame } from './test-frame';
import { SocketConnection } from './socket-connection';

export function* createAgent(connectTo: string) {
  if (!connectTo) {
    throw new Error("no orchestrator URL given, please specify the URL of the orchestrator by setting the `orchestrator` query param");
  }

  let testFrame = yield TestFrame.start();
  let connection = yield SocketConnection.start(connectTo);

  yield fork(function*() {
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
      yield fork(run(testFrame, message));
    }
  }
}

function* run(testFrame: TestFrame, { appUrl, manifestUrl, testRunId, tree }) {
  console.log('[agent] loading test app via', appUrl);

  yield testFrame.load(appUrl);
}
