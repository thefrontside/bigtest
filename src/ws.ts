import { createServer } from 'http';
import {
  server as WebSocketServer,
  connection as Connection,
  request as Request,
  IMessage as Message
} from 'websocket';

import { fork, Sequence, Operation, Execution } from 'effection';
import { getCurrentExecution } from './util';

import { listen, ReadyCallback } from './http';

export function* createSocketServer(port: number, handler: ConnectionHandler, ready: ReadyCallback = x=>x): Sequence {
  let server = createServer();

  yield listen(server, port);

  ready(server);

  let socket = new WebSocketServer({
    httpServer: server
  });

  let execution = getCurrentExecution();

  function spawnConnection(request: Request) {
    let connection = request.accept(null, request.origin);
    execution.resume(connection);
  }

  socket.on("request", spawnConnection);

  try {
    while (true) {
      let connection: Connection = yield;

      let handle = fork(function* setupConnection() {
        let halt = () => handle.halt();
        let fail = (error) => handle.throw(error);
        connection.on("error", fail);
        connection.on("close", halt);
        try {
          yield handler(connection);
        } finally {
          connection.off("close", halt);
          connection.off("error", fail);
          connection.close();
        }
      }) as any;

    }
  } finally {
    socket.off("request", spawnConnection);
    server.close();
  }
}

function send(connection: Connection, data: string): Operation {
  return (execution: Execution<void>) => {
    let iCare = true;
    connection.send(data, error => {
      if (iCare) {
        if (error) {
          execution.throw(error);
        } else {
          execution.resume();
        }
      }
    });
    return () => iCare = false;
  }
}
export { Connection, Message, send }

type ConnectionHandler = (conn: Connection) => Operation;
