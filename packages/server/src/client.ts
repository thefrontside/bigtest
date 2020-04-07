import { w3cwebsocket as WebSocket } from 'websocket';
import { EventEmitter } from 'events';
import { monitor, Operation, Context } from 'effection';

import { once } from '@bigtest/effection';

import { Message, isErrorResponse, isDataResponse } from './protocol';

export class Client {
  responseIds = 0;
  subscriptions = new EventEmitter();

  private constructor(private socket: WebSocket, context: Context) {
    let { subscriptions } = this;
    socket.onopen = () => subscriptions.emit('open');
    socket.onclose = event => subscriptions.emit('close', event);
    socket.onmessage = event => subscriptions.emit('message', event);
    socket.onerror = event => subscriptions.emit('error', event);
    context['ensure'](() => {
      socket.onopen = socket.onclose = socket.onmessage = socket.onerror = null;
      socket.close();
    });

    context['spawn'](monitor(function* () {
      let [error]: [Error] = yield once(subscriptions, 'error');
      throw error;
    }));

    context['spawn'](monitor(function* () {
      yield once(subscriptions, 'close');
      throw new Error('Socket closed on the remote end');
    }));
  }

  static *create(url: string): Operation<Client> {
    let client = new Client(new WebSocket(url), yield parent);

    yield once(client.subscriptions, 'open');

    return client;
  }

  query(source: string): Operation {
    return this.send({ query: source }, next => next());
  }

  subscribe(source: string, forEach: (response: unknown) => Operation): Operation {
    return this.send({ query: source, live: true }, function*(next) {
      while (true) {
        let response = yield next();
        yield forEach(response);
      }
    })
  }

  *send(command: Query, handle: HandleResponse): Operation {
    let responseId = `${this.responseIds++}`; //we'd want a UUID to avoid hijacking?
    let request: Message = {...command, responseId};

    this.socket.send(JSON.stringify(request));

    let { subscriptions } = this;

    let next = function* getNextResponse() {
      while (true) {
        let [event]: [MessageEvent] = yield once(subscriptions, 'message');
        let message: Message = JSON.parse(event.data);

        if (message.responseId === responseId) {
          if (isErrorResponse(message)) {
            let messages = message.errors.map(error => error.message);
            throw new Error(messages.join("\n"));;
          }
          if (isDataResponse(message)) {
            return message.data;
          } else {
            console.warn('unknown response format: ', event.data);
          }
        }
      }
    }

    return yield handle(next);
  }
}

interface HandleResponse {
  (next: () => Operation): Operation;
}

interface Query {
  query: string;
  live?: boolean;
}

const parent: Operation = ({ resume, context: { parent }}) => resume(parent.parent);
