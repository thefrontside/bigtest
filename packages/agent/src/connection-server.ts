import { fork, Operation } from 'effection';
import { Mailbox, readyResource } from '@bigtest/effection';
import { express, Express, Socket } from '@bigtest/effection-express';

interface AgentConnectionServerOptions {
  port: number;
  inbox: Mailbox;
  delegate: Mailbox;
}

export class AgentConnectionServer {
  constructor(public options: AgentConnectionServerOptions) {}

  *listen(): Operation<Express> {
    let { port, inbox, delegate } = this.options;

    let app = express();

    return yield readyResource(app, function*(ready) {
      yield app.ws('*', handleSocket(inbox, delegate));
      yield app.listen(port);
      ready();
      yield;
    });
  }
}

let ids = 1;

function handleSocket(inbox: Mailbox, delegate: Mailbox): (socket: Socket) => Operation<void> {
  return function*(socket) {
    let agentId = `agent.${ids++}`;

    let messages = yield socket.subscribe();

    yield fork(function*() {
      while (true) {
        let message = yield inbox.receive({ agentId });
        yield socket.send(message);
      }
    });

    yield fork(function*() {
      while (true) {
        let message = yield messages.receive();
        message.agentId = agentId;
        delegate.send(message);
      }
    });

    delegate.send({ status: 'connected', agentId });

    try {
      yield;
    } finally {
      delegate.send({ status: 'disconnected', agentId });
    }
  }
}
