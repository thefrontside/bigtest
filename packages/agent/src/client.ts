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

  *listen(forEach: (connection: AgentConnection) => Operation): Operation {
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
        yield acceptConnections(socketServer, inbox, delegate, forEach);
      } finally {
        socketServer.unmount();
      }
    }));

    httpServer.listen(port);
    yield once(httpServer, "listening");
  }
}

function* acceptConnections(server: WebSocketServer, inbox: Mailbox, delegate: Mailbox, each: (connection: AgentConnection) => Operation): Operation {
  while (true) {
    let [request]: [Request] = yield once(server, "request");
    let connection = request.accept(null, request.origin);

    let ids = 1;
    let handler = yield fork(function* setupConnection() {
      let halt = () => handler.halt();
      let fail = (error: Error) => {
        if(error["code"] === 'ECONNRESET') {
          handler.halt();
        } else {
          handler.fail(error);
        }
      }

      let agent = new AgentConnection(`agent.${ids++}`);

      let messages = yield Mailbox.subscribe(connection, "message", ({ args }) => {
        let [message] = args as Message[];
        return { message: JSON.parse(message.utf8Data) };
      })

      yield fork(function*() {
        while (true) {
          let message = yield inbox.receive({ agentId: agent.id });

          let sendData = promisify<string, void>(connection.send.bind(connection));
          yield sendData(JSON.stringify(message));
        }
      });

      yield fork(function*() {
        while (true) {
          let message = yield messages.receive();
          delegate.send(message);
        }
      });

      try {
        connection.on("error", fail);
        connection.on("close", halt);
        delegate.send({ connected: true });

        yield each(agent);
      } finally {
        delegate.send({ connected: false });
        connection.off("error", fail);
        connection.off("close", halt);
      }
    });
  }
}

export class AgentConnection {
  constructor(public readonly id: string) {}
}
