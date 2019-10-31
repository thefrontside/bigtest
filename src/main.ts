import { Execution, Operation, Sequence, fork, timeout } from 'effection';
import { createServer, end, IncomingMessage, ServerResponse } from './http';
import { createSocketServer, Connection, Message } from './ws';
import { AddressInfo } from 'net';

// entry point for bigtestd
export function* main(): Sequence {
  console.log('BigTest Server');

  // accept commands from the outside world (CLI, UI, etc...)
  fork(createServer(4000, commandServer, server => {
    let address = server.address() as AddressInfo;
    console.log(`-> listening for commands on port ${address.port}`);
  }));


  // TODO: serves the application with our special controls injected.
  // fork(proxyServer);


  // TODO: realtime socket communication with browsers
  fork(createSocketServer(5001, connectionServer, server => {
    let address = server.address() as AddressInfo;
    console.log(`-> accepting agent connections on port ${address.port}`);
  }));

  // TODO: serves the raw application
  // fork(buildServer);
}

function* commandServer(req: IncomingMessage, res: ServerResponse): Sequence {
  res.writeHead(200, {
    'X-Powered-By': 'effection'
  });
  yield end(res, "Your wish is my command\n");
}

function* connectionServer(connection: Connection): Sequence {
  fork(function* heartbeat() {
    while (true) {
      yield timeout(10000);
      yield connection.send(JSON.stringify({type: "heartbeat"}));
    }
  })

  while (true) {
    let message: Message = yield connection.receiveMessage();
    console.log(`mesage = `, message);
  }
}
