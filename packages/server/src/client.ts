import { w3cwebsocket } from 'websocket';
import { spawn, resource, Operation } from 'effection';

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
      yield spawn(function* (): Operation<void> {
        let [event] = yield once(socket, 'close');
        if(event.code !== 1000) {
          throw new Error(`Socket closed on the remote end: [${event.code}] ${event.reason}`);
        }
      });
      yield;
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

  *subscription(source: string): Operation {
    return yield this.send("subscription", source);
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
          } else if (isDoneResponse(message)) {
            break;
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
