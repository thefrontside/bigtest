import { w3cwebsocket } from 'websocket';
import { spawn, resource, Operation } from 'effection';

import { ensure, Mailbox } from '@bigtest/effection';
import { once } from '@effection/events';

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
      yield spawn(function* () {
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
    let subscription = yield this.subscribe(source, false);
    return yield subscription.receive();
  }

  *subscribe(source: string, live = true): Operation<Mailbox> {
    let mailbox = new Mailbox();
    let responseId = this.send({ query: source, live });
    let socket = this.socket;

    return yield resource(mailbox, function*() {
      let messages = yield Mailbox.subscribe(socket, "message");

      while (true) {
        let { args } = yield messages.receive();
        let message: Message = JSON.parse(args[0].data);
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

  send(command: Query): string {
    let responseId = `${responseIds++}`; //we'd want a UUID to avoid hijacking?
    let request: Message = {...command, responseId};

    this.socket.send(JSON.stringify(request));

    return responseId;
  }
}

interface HandleResponse {
  (next: () => Operation): Operation;
}

interface Query {
  query: string;
  live?: boolean;
}
