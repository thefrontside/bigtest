import { w3cwebsocket } from 'websocket';
import { spawn, resource, Operation } from 'effection';

import { once, ensure, monitorErrors, Mailbox } from '@bigtest/effection';

import { Message, isErrorResponse, isDataResponse } from './protocol';

let responseIds = 0;

type WebSocket = w3cwebsocket & EventTarget;

export class Client {
  private constructor(private socket: WebSocket) {}

  static *create(url: string): Operation<Client> {
    let socket = new w3cwebsocket(url) as WebSocket;

    let client = new Client(socket);
    let res = yield resource(client, function*() {
      yield ensure(() => {
        socket.close();
      });
      yield monitorErrors(socket);
      yield spawn(function* () {
        yield once(socket, 'close');
        throw new Error('Socket closed on the remote end');
      });
      yield;
    });

    yield once(socket, 'open');

    return res;
  }

  *query(source: string): Operation {
    let responseId = this.send({ query: source });

    let events = yield Mailbox.subscribe(this.socket, "message");
    let messages = yield events.map(({ args }) => JSON.parse(args[0].data));

    let message = yield this.receive(messages, responseId);
    return message.data;
  }

  *subscribe(source: string, forEach: (response: unknown) => Operation): Operation {
    let responseId = this.send({ query: source, live: true });

    let events = yield Mailbox.subscribe(this.socket, "message");
    let messages = yield events.map(({ args }) => JSON.parse(args[0].data));

    while (true) {
      let message = yield this.receive(messages, responseId);
      yield forEach(message.data);
    }
  }

  *receive(mailbox: Mailbox, responseId: string) {
    let message = yield mailbox.receive({ responseId });

    if (isErrorResponse(message)) {
      let messages = message.errors.map(error => error.message);
      throw new Error(messages.join("\n"));;
    }
    if (isDataResponse(message)) {
      return message;
    } else {
      console.warn('unknown response format: ', message);
    }
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
