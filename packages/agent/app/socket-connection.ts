import { Operation } from 'effection';
import { Mailbox } from './effection/mailbox';

export class SocketConnection {
  static *start(connectTo: string) {
    let socket = new WebSocket(connectTo);
    let mailbox = yield Mailbox.watch(socket, ['open', 'message', 'close']);
    yield mailbox.receive({ event: 'open' });
    return new SocketConnection(socket, mailbox);
  }

  constructor(private connection: WebSocket, private mailbox: Mailbox) {}

  send(message: unknown) {
    this.connection.send(JSON.stringify(message));
  }

  *receive(): Operation {
    let { args: [event] } = yield this.mailbox.receive({ event: 'message' });
    return JSON.parse(event.data);
  }
}
