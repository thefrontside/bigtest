import { createServer, Server } from 'http';
import {
  server as WebSocketServer,
  connection as Connection,
  request as Request,
  IMessage as Message
} from 'websocket';

import { fork, Operation } from 'effection';
import { resumeOnCb } from './util';

import { on } from '@effection/events';

import { listen } from './http';

interface UseServer { (server: Server): Operation }

export function* createSocketServer(port: number, handler: ConnectionHandler, ready: UseServer): Operation {
  let server = createServer();

  yield listen(server, port);

  yield ready(server);

  let socket = new WebSocketServer({
    httpServer: server
  });

  try {
    while (true) {
      let [request]: [Request] = yield on(socket, "request");
      let connection = request.accept(null, request.origin);

      let handle = yield fork(function* setupConnection() {
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

export function sendData(connection: Connection, data: string): Operation {
  return resumeOnCb(cb => connection.send(data, cb));
}

export { Connection, Message }

type ConnectionHandler = (conn: Connection) => Operation;
