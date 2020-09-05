import { w3cwebsocket } from 'websocket';
import { resource, Operation, spawn } from 'effection';
import { on, once } from '@effection/events';
import { createSubscription } from '@effection/subscription';

import { Variables, Response, isErrorResponse, isDataResponse, isDoneResponse } from './protocol';
import { NoServerError } from './errors';

let responseIds = 0;

type WebSocket = w3cwebsocket & EventTarget;

export class Client {
  private constructor(private socket: WebSocket) {}

  static *create(url: string): Operation<Client> {
    let socket = new w3cwebsocket(url) as WebSocket;

    yield spawn(function* detectStartupError(): Operation<void> {
      let [error] = yield once(socket, 'error');

      if (isErrorEvent(error)) {
        throw new NoServerError(`Could not connect to server at ${url}`);
      } else {
        throw error;
      }
    });

    let client = new Client(socket);
    let res = yield resource(client, function*() {
      try {
        let [{ reason, code }] = yield once(socket, 'close');
        if(code !== 1000) {
          throw new Error(`websocket server closed connection unexpectedly: [${code}] ${reason}`);
        }
      } finally {
        socket.close();
      }
    });

    yield once(socket, 'open');

    return res;
  }

  query<T>(source: string, variables?: Variables): Operation<T> {
    return this.send<T>("query", source, false, variables).expect();
  }

  mutation<T>(source: string, variables?: Variables): Operation<T> {
    return this.send<T>("mutation", source, false, variables).expect();
  }

  liveQuery<T>(source: string, variables?: Variables) {
    return this.send<T>("query", source, true, variables);
  }

  subscription<T, TReturn>(source: string, variables?: Variables) {
    return this.send<T, TReturn>("subscription", source, false, variables);
  }

  private send<T = unknown,TReturn = unknown>(type: string, source: string, live = false, variables?: Variables) {
    let { socket } = this;

    return createSubscription<T, TReturn>(function*(publish) {
      let messages = yield on<[MessageEvent]>(socket, "message")
        .map(([event]) => JSON.parse(event.data) as Response)


      let responseId = `${responseIds++}`; //we'd want a UUID to avoid hijacking?

      socket.send(JSON.stringify({ [type]: source, live, responseId, variables }));

      while (true) {
        let next: IteratorResult<Response> = yield messages.next();

        if (!next.done && next.value.responseId === responseId) {
          let response = next.value;
          if (isErrorResponse(response)) {
            let messages = response.errors.map(error => error.message);
            throw new Error(messages.join("\n"));;
          }
          if (isDataResponse(response)) {
            publish(response.data as T)
          }
          if (isDoneResponse(response)) {
            return response.data as TReturn;
          }
        }
      }
    });
  }
}

interface ErrorEvent {
  type: 'error';
}

function isErrorEvent(error: { type?: 'error' }): error is ErrorEvent {
  return error.type === 'error';
}