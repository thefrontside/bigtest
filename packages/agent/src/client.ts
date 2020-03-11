import { fork, monitor, Operation } from 'effection';
import { createServer } from 'http';
import { promisify } from 'util';

import {
  server as WebSocketServer,
  request as Request,
  IMessage as Message
} from 'websocket';

import { Mailbox, once, suspend, ensure } from '@bigtest/effection';

interface AgentConnectionServerOptions {
  port: number;
  inbox: Mailbox;
  delegate: Mailbox;
}

export class AgentConnectionServer {
  constructor(public options: AgentConnectionServerOptions) {}

  *listen(): Operation {
    let { port, inbox, delegate } = this.options;

    let httpServer = createServer();
    let socketServer = new WebSocketServer({ httpServer });

    yield suspend(monitor(function*() {
      yield ensure(() => httpServer.close());
      yield monitor(function* raiseServerErrors() {
        let [error]: [Error] = yield once(httpServer, "error");
        throw error;
      });

      try {
        yield acceptConnections(socketServer, inbox, delegate);
      } finally {
        socketServer.unmount();
      }
    }));

    httpServer.listen(port);
    yield once(httpServer, "listening");
  }
}

let ids = 1;

function* acceptConnections(server: WebSocketServer, inbox: Mailbox, delegate: Mailbox): Operation {
  while (true) {
    let [request]: [Request] = yield once(server, "request");
    let connection = request.accept(null, request.origin);
    let sendData = promisify<string, void>(connection.send.bind(connection));
    let agentId = `agent.${ids++}`;

    let handler = yield fork(function* setupConnection() {
      let halt = () => handler.halt();
      let fail = (error: Error) => {
        if(error["code"] === 'ECONNRESET') {
          handler.halt();
        } else {
          handler.fail(error);
        }
      }

      let messages = yield Mailbox.subscribe(connection, "message", ({ args }) => {
        let [message] = args as Message[];
        return JSON.parse(message.utf8Data);
      })

      yield fork(function*() {
        while (true) {
          let message = yield inbox.receive({ agentId });
          yield sendData(JSON.stringify(message));
        }
      });

      yield fork(function*() {
        while (true) {
          let message = yield messages.receive();
          message.agentId = agentId;
          delegate.send(message);
        }
      });

      try {
        connection.on("error", fail);
        connection.on("close", halt);
        delegate.send({ status: 'connected', agentId });

        yield;
      } finally {
        delegate.send({ status: 'disconnected', agentId });
        connection.off("error", fail);
        connection.off("close", halt);
      }
    });
  }
}
