import { spawn, fork, Operation } from 'effection';
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
      yield spawn(app.ws('*', handleSocket(inbox, delegate)));
      yield app.listen(port);
      ready();
      yield;
    });
  }
}

const ids = (function* agentIds() {
  let id = 0;
  while (true) {
    yield `Agent:${id++}`;
  }
})()

function handleSocket(inbox: Mailbox, delegate: Mailbox): (socket: Socket) => Operation<void> {
  return function*(socket) {

    let messages = yield socket.subscribe();

    let { agentId } = yield messages.receive({ type: 'connected' });

    agentId = agentId || ids.next().value;

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
