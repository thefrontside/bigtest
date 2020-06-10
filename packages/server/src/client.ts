import { w3cwebsocket } from 'websocket';
import { resource, Operation } from 'effection';

import { ensure, Mailbox } from '@bigtest/effection';
import { on, once } from '@effection/events';

import { Message, isErrorResponse, isDataResponse } from './protocol';

let responseIds = 0;

type WebSocket = w3cwebsocket & EventTarget;

export class Client {
  private constructor(private socket: WebSocket) {}

  static *create(url: string): Operation<Client> {
    let socket = new w3cwebsocket(url) as WebSocket;

    let client = new Client(socket);
    let res = yield resource(client, function*() {
      yield ensure(() => socket.close());

      let [{ reason, code }] = yield once(socket, 'close');
      if(code !== 1000) {
        throw new Error(`websocket server closed connection unexpectedly: [${code}] ${reason}`);
      }
    });

    yield once(socket, 'open');

    return res;
  }

  *query(source: string): Operation {
    let subscription = yield this.send("query", source, false);
    return yield subscription.receive();
  }

  *liveQuery(source: string): Operation {
    return yield this.send("query", source, true);
  }

  *mutation(source: string): Operation {
    let subscription = yield this.send("mutation", source);
    return yield subscription.receive();
  }

  private *send(type: string, source: string, live = false): Operation<Mailbox> {
    let mailbox = new Mailbox();
    let { socket } = this;

    return yield resource(mailbox, function*(): Operation<void> {
      let messages = yield on(socket, "message");

      let responseId = `${responseIds++}`; //we'd want a UUID to avoid hijacking?

      socket.send(JSON.stringify({ [type]: source, live, responseId}));

      while (true) {
        let [event] = yield messages.next();
        let message: Message = JSON.parse(event.data);

        if(message.responseId === responseId) {
          if (isErrorResponse(message)) {
            let messages = message.errors.map(error => error.message);
            throw new Error(messages.join("\n"));;
          }
          if (isDataResponse(message)) {
            mailbox.send(message.data);
          } else {
            throw new Error("unknown response format");;
          }
        }
      }
    });
  }
}

interface HandleResponse {
  (next: () => Operation): Operation;
}

interface Query {
  query: string;
  live?: boolean;
}
