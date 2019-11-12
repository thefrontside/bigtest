import { createServer } from 'http';
import {
  server as WebSocketServer,
  connection as WebSocketConnection,
  request as Request,
  IMessage as Message
} from 'websocket';

import { fork, Sequence, Operation } from 'effection';
import { getCurrentExecution, resumeOnCb, EventEmitter } from './util';

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
      let connection: WebSocketConnection = yield;

      let handle = fork(function* setupConnection() {
        let halt = () => handle.halt();
        let fail = (error) => handle.throw(error);
        connection.on("error", fail);
        connection.on("close", halt);
        try {
          yield handler(new Connection(connection));
        } finally {
          connection.off("close", halt);
          connection.off("error", fail);
          connection.close();
        }
      });

    }
  } finally {
    socket.off("request", spawnConnection);
    server.close();
  }
}

type ConnectionEvent = "message" | "frame" | "close" | "error" | "drain" | "pause" | "resume" | "ping" | "pong";

class Connection extends EventEmitter<WebSocketConnection, ConnectionEvent> {
  send(data: string): Operation {
    return resumeOnCb((cb) => this.inner.send(data, cb));
  }
}

export { Connection, Message }

type ConnectionHandler = (conn: Connection) => Operation;
