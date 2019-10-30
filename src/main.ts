import { Execution, Operation, Sequence, fork, timeout } from 'effection';
import { createServer, end, IncomingMessage, ServerResponse } from './http';
import { createSocketServer, Connection, Message, send } from './ws';
import { AddressInfo } from 'net';
import { EventEmitter } from 'events';

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
      yield send(connection, JSON.stringify({type: "heartbeat"}));
    }
  })

  while (true) {
    let message: Message = yield until(connection, "messsage");
    console.log(`mesage = `, message);
  }
}

function until(emitter: EventEmitter, eventName: string): Operation {
  return (execution: Execution) => {
    let resume = (event) => execution.resume(event);
    emitter.on(eventName, resume);
    return () => emitter.off(eventName, resume);
  }
}
