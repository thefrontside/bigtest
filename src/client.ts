import { w3cwebsocket as WebSocket } from 'websocket';
import { EventEmitter } from 'events';
import { monitor, Operation } from 'effection';
import { on } from './effection/events'

import { Message, isErrorResponse, isDataResponse } from './protocol';

const parent: Operation = ({ resume, context: { parent }}) => resume(parent);

export class Client {
  query: (source: string) => Operation;
  subscribe: (source: string, forEach: (result: unknown) => Operation) => Operation;

  static *create(url: string): Operation {
    let { parent: context } = yield parent;

    let client = new Client();
    let subscriptions = new EventEmitter();
    let socket = new WebSocket(url);
    let responseIds = 0;

    socket.onopen = () => subscriptions.emit('open');
    socket.onclose = event => subscriptions.emit('close', event);
    socket.onmessage = event => subscriptions.emit('message', event);
    socket.onerror = event => subscriptions.emit('error', event);

    context.ensure(() => {
      socket.onopen = socket.onclose = socket.onmessage = socket.onerror = null;
      socket.close();
    });

    context.spawn(monitor(function* () {
      let [error]: [Error] = yield on(subscriptions, 'error');
      throw error;
    }));

    context.spawn(monitor(function* () {
      yield on(subscriptions, 'close');
      throw new Error('Socket closed on the remote end');
    }));

    function* send<Command>(command: Command, handle: (next: () => Operation) => Operation) {
      let responseId = `${responseIds++}`; //we'd want a UUID to avoid hijacking?
      let request: Message = {...command, responseId};

      socket.send(JSON.stringify(request));

      let next = function* getNextResponse() {
        while (true) {
          let [event]: [MessageEvent] = yield on(subscriptions, 'message');
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

    client.query = function query(source: string): Operation {
      return send({ query: source }, function*(next) {
        return yield next();
      });
    }

    client.subscribe = function subscribe(source, forEach): Operation {
      return send({ query: source, live: true }, function*(next) {
        while (true) {
          let response = yield next();
          yield forEach(response);
        }
      })
    }

    yield on(subscriptions, 'open');

    return client;
  }
}
