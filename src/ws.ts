import { createServer } from 'http';
import {
  server as WebSocketServer,
  connection as Connection,
  request as Request,
  IMessage as Message
} from 'websocket';

import { fork, Sequence, Operation } from 'effection';
import { resumeOnCb } from './util';

import { on } from '@effection/events';

import { listen, ReadyCallback } from './http';

export function* createSocketServer(port: number, handler: ConnectionHandler, ready: ReadyCallback = x=>x): Sequence {
  let server = createServer();

  yield listen(server, port);

  ready(server);

  let socket = new WebSocketServer({
    httpServer: server
  });

  try {
    while (true) {
      let [request]: [Request] = yield on(socket, "request");
      let connection = request.accept(null, request.origin);

      let handle = fork(function* setupConnection() {
        let halt = () => handle.halt();
        let fail = (error: Error) => handle.throw(error);
        connection.on("error", fail);
        connection.on("close", halt);
        try {
          yield handler(connection);
        } finally {
          connection.off("close", halt);
          connection.off("error", fail);
          connection.close();
        }
      });

    }
  } finally {
    server.close();
  }
}

export function send(connection: Connection, data: string): Operation {
  return resumeOnCb(cb => connection.send(data, cb));
}

export { Connection, Message }

type ConnectionHandler = (conn: Connection) => Operation;
